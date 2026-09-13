import type { ChatRequest, ChatResponse } from './types';
import { createAbortSignal, isAbortError } from '@naufalrf/http';

export class ChatServiceError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ChatServiceError';
  }
}

interface SendChatMessageOptions {
  request: ChatRequest;
}

const CHAT_REQUEST_TIMEOUT_MS = 10000;

export async function sendChatMessage({ request }: SendChatMessageOptions): Promise<ChatResponse> {
  try {
    const endpoint = '/api/rag/chat';
    const { signal, cleanup } = createAbortSignal(CHAT_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw new ChatServiceError(
          String((errorData.error as Record<string, string>)?.message ?? 'Failed to get response from AI'),
          response.status
        );
      }

      const data: ChatResponse = await response.json();
      return data;
    } finally {
      cleanup();
    }
  } catch (error) {
    if (error instanceof ChatServiceError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new ChatServiceError(
        'AI sedang lambat merespons. Silakan coba lagi dalam beberapa saat.',
        504
      );
    }

    throw new ChatServiceError(
      'Maaf, saat ini AI tidak tersedia. Silakan coba lagi beberapa saat atau hubungi saya melalui formulir kontak.'
    );
  }
}

export async function confirmAction(
  actionId: string,
  confirm: boolean,
  sessionId: string,
): Promise<{ success: boolean; message: string }> {
  const endpoint = '/api/rag/chat/confirm';
  const { signal, cleanup } = createAbortSignal(CHAT_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, confirm, sessionId }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
      throw new ChatServiceError(
        String((errorData.error as Record<string, string>)?.message ?? 'Failed to confirm action'),
        response.status,
      );
    }

    return (await response.json()) as { success: boolean; message: string };
  } finally {
    cleanup();
  }
}
