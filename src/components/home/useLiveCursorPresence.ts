import { useEffect, useState, useSyncExternalStore } from 'react';
import { resolveLiveCursorIdentity, type LiveCursorIdentity } from '@/lib/guestbookIdentity';
import { createAbortSignal } from '@naufalrf/http';

export interface LiveCursorParticipant {
  id: string;
  roomId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  isTouching: boolean;
  pagePath: string;
  pageLabel: string;
  sectionId: string | null;
  sectionLabel: string | null;
  lastSeen: number;
}

type Status = 'connecting' | 'connected' | 'disconnected';

type PresenceMessage =
  | { type: 'welcome'; payload: { selfId: string; roomId: string } }
  | { type: 'state'; payload: { participants: LiveCursorParticipant[] } }
  | { type: 'overview'; payload: { participants: LiveCursorParticipant[] } }
  | { type: 'pong' }
  | { type: 'rejoin' };

const HEARTBEAT_MS = 5000;
const HEARTBEAT_TIMEOUT_MS = 20000;
const SEND_INTERVAL_MS = 60;
const RECONNECT_DELAY_MS = 5000;
const HEALTHCHECK_TIMEOUT_MS = 1500;
const CLIENT_ID_KEY = 'portfolio-live-presence-client-id';

function getClientId(): string {
  try {
    const existing = window.sessionStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const clientId = window.crypto.randomUUID();
    window.sessionStorage.setItem(CLIENT_ID_KEY, clientId);
    return clientId;
  } catch {
    return window.crypto.randomUUID();
  }
}

function getSocketUrl(socketUrl: string): string {
  return socketUrl.trim() || 'ws://localhost:3006/ws';
}

function getHealthUrl(socketUrl: string): string | null {
  try {
    const url = new URL(getSocketUrl(socketUrl));
    url.protocol = url.protocol === 'wss:' ? 'https:' : 'http:';
    url.pathname = url.pathname.replace(/\/ws$/, '/health');
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function resolveRoomId(currentPath: string): string {
  if (!currentPath || currentPath === '/') {
    return 'public-home';
  }
  return `public${currentPath.replace(/[^a-zA-Z0-9/_-]/g, '')}`;
}

export interface PresenceState {
  status: Status;
  self: LiveCursorParticipant | null;
  others: LiveCursorParticipant[];
  overviewParticipants: LiveCursorParticipant[];
  totalParticipants: number;
  identity: LiveCursorIdentity | null;
}

const INITIAL_STATE: PresenceState = {
  status: 'disconnected',
  self: null,
  others: [],
  overviewParticipants: [],
  totalParticipants: 0,
  identity: null,
};

interface Store {
  state: PresenceState;
  currentPath: string;
  socketUrl: string;
  socket: WebSocket | null;
  selfId: string | null;
  participants: LiveCursorParticipant[];
  heartbeatId: number | null;
  reconnectId: number | null;
  rafId: number | null;
  queuedMove: { x: number; y: number; isTouching: boolean; sectionId: string | null; sectionLabel: string | null } | null;
  lastSentAt: number;
  shouldReconnect: boolean;
  connectAttempt: number;
  listeners: Set<() => void>;
  mountRefCount: number;
}

const store: Store = {
  state: INITIAL_STATE,
  currentPath: '/',
  socketUrl: '',
  socket: null,
  selfId: null,
  participants: [],
  heartbeatId: null,
  reconnectId: null,
  rafId: null,
  queuedMove: null,
  lastSentAt: 0,
  shouldReconnect: false,
  connectAttempt: 0,
  listeners: new Set(),
  mountRefCount: 0,
};

function notify(): void {
  store.listeners.forEach((l) => l());
}

function setState(next: Partial<PresenceState>): void {
  store.state = { ...store.state, ...next };
  notify();
}

function getPageLabel(currentPath: string): string {
  return currentPath === '/'
    ? 'Home'
    : currentPath
        .split('/')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' / ');
}

function clearTimers(): void {
  if (store.heartbeatId !== null) {
    window.clearInterval(store.heartbeatId);
    store.heartbeatId = null;
  }
  if (store.reconnectId !== null) {
    window.clearTimeout(store.reconnectId);
    store.reconnectId = null;
  }
  if (store.rafId !== null) {
    window.cancelAnimationFrame(store.rafId);
    store.rafId = null;
  }
}

function sendMessage(message: object): void {
  const socket = store.socket;
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(message));
}

function flushQueuedMove(): void {
  store.rafId = null;
  const queued = store.queuedMove;
  if (!queued) return;

  const now = performance.now();
  if (now - store.lastSentAt < SEND_INTERVAL_MS) {
    store.rafId = window.requestAnimationFrame(flushQueuedMove);
    return;
  }

  store.lastSentAt = now;
  store.queuedMove = null;
  sendMessage({ type: 'move', payload: queued });
}

export function queueMove(move: {
  x: number;
  y: number;
  isTouching: boolean;
  sectionId: string | null;
  sectionLabel: string | null;
}): void {
  store.queuedMove = move;
  if (store.rafId === null) {
    store.rafId = window.requestAnimationFrame(flushQueuedMove);
  }
}

function scheduleReconnect(identity: LiveCursorIdentity): void {
  if (!store.shouldReconnect || store.reconnectId !== null) return;
  store.reconnectId = window.setTimeout(() => {
    store.reconnectId = null;
    void connect(identity);
  }, RECONNECT_DELAY_MS);
}

async function connect(identity: LiveCursorIdentity): Promise<void> {
  const attempt = ++store.connectAttempt;
  const socketUrl = store.socketUrl;
  const currentPath = store.currentPath;
  clearTimers();
  store.shouldReconnect = true;
  setState({ status: 'connecting', self: null, others: [], overviewParticipants: [], totalParticipants: 0 });
  store.selfId = null;
  store.participants = [];

  const healthUrl = getHealthUrl(socketUrl);
  if (healthUrl) {
    const { signal, cleanup } = createAbortSignal(HEALTHCHECK_TIMEOUT_MS);
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Presence health check failed: ${response.status}`);
    } catch {
      if (store.shouldReconnect && attempt === store.connectAttempt) {
        setState({ status: 'disconnected' });
        scheduleReconnect(identity);
      }
      return;
    } finally {
      cleanup();
    }
  }

  if (!store.shouldReconnect || attempt !== store.connectAttempt) return;

  const socket = new WebSocket(getSocketUrl(socketUrl));
  store.socket = socket;
  const pageLabel = getPageLabel(currentPath);
  const roomId = resolveRoomId(currentPath);
  const clientId = getClientId();
  let lastPongAt = 0;

  const sendJoin = () => sendMessage({
    type: 'join',
    payload: {
      roomId,
      clientId,
      name: identity.name,
      color: identity.color,
      x: 0.5,
      y: 0.5,
      isTouching: false,
      pagePath: currentPath,
      pageLabel,
      sectionId: null,
      sectionLabel: null,
    },
  });

  socket.addEventListener('open', () => {
    if (store.socket !== socket || attempt !== store.connectAttempt) return;
    setState({ status: 'connected' });
    lastPongAt = Date.now();
    sendJoin();
    store.heartbeatId = window.setInterval(() => {
      if (store.socket !== socket || attempt !== store.connectAttempt) return;
      if (Date.now() - lastPongAt > HEARTBEAT_TIMEOUT_MS) {
        socket.close(4000, 'Heartbeat timeout');
        return;
      }
      sendMessage({ type: 'ping' });
    }, HEARTBEAT_MS);
  });

  socket.addEventListener('message', (event) => {
    if (store.socket !== socket || attempt !== store.connectAttempt) return;
    try {
      const message = JSON.parse(event.data) as PresenceMessage;
      if (message.type === 'pong') {
        lastPongAt = Date.now();
        return;
      }
      if (message.type === 'rejoin') {
        sendJoin();
        return;
      }
      if (message.type === 'welcome') {
        store.selfId = message.payload.selfId;
        recomputeParticipants();
        return;
      }
      if (message.type === 'state') {
        store.participants = message.payload.participants;
        recomputeParticipants();
        return;
      }
      if (message.type === 'overview') {
        setState({
          overviewParticipants: message.payload.participants,
          totalParticipants: message.payload.participants.length || store.participants.length,
        });
      }
    } catch {
    }
  });

  socket.addEventListener('close', () => {
    if (store.socket !== socket || attempt !== store.connectAttempt) return;
    store.socket = null;
    setState({ status: 'disconnected' });
    clearTimers();
    if (!store.shouldReconnect) return;
    scheduleReconnect(identity);
  });

  socket.addEventListener('error', () => {
    if (store.socket !== socket || attempt !== store.connectAttempt) return;
    setState({ status: 'disconnected' });
    socket.close();
  });
}

function recomputeParticipants(): void {
  const self = store.participants.find((p) => p.id === store.selfId) || null;
  const others = store.participants.filter((p) => p.id !== store.selfId);
  setState({
    self,
    others,
    totalParticipants: store.state.overviewParticipants.length || store.participants.length,
  });
}

function disconnect(): void {
  store.connectAttempt += 1;
  store.shouldReconnect = false;
  clearTimers();
  store.queuedMove = null;
  const socket = store.socket;
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'leave' }));
  }
  socket?.close();
  store.socket = null;
  store.participants = [];
  store.selfId = null;
  setState(INITIAL_STATE);
}

function subscribe(listener: () => void): () => void {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

function getSnapshot(): PresenceState {
  return store.state;
}

function getServerSnapshot(): PresenceState {
  return INITIAL_STATE;
}

export function useLiveCursorPresence(currentPath: string, socketUrl: string) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    store.mountRefCount += 1;
    store.socketUrl = socketUrl;

    if (!store.state.identity) {
      const identity = resolveLiveCursorIdentity();
      setState({ identity });
    }

    return () => {
      store.mountRefCount -= 1;
      if (store.mountRefCount <= 0) {
        store.mountRefCount = 0;
        disconnect();
      }
    };
  }, [socketUrl]);

  useEffect(() => {
    if (!state.identity) return;
    if (store.currentPath !== currentPath) {
      store.currentPath = currentPath;
      const identity = state.identity;
      const oldSocket = store.socket;
      if (oldSocket?.readyState === WebSocket.OPEN) {
        oldSocket.send(JSON.stringify({ type: 'leave' }));
      }
      store.connectAttempt += 1;
      oldSocket?.close();
      store.socket = null;
      clearTimers();
      void connect(identity);
    } else if (!store.socket && !store.shouldReconnect && store.mountRefCount > 0) {
      void connect(state.identity);
    }
  }, [currentPath, state.identity]);

  return {
    identity: state.identity,
    status: state.status,
    self: state.self,
    others: state.others,
    overviewParticipants: state.overviewParticipants,
    totalParticipants: state.totalParticipants,
    sendMove: queueMove,
  };
}
