

import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Timer,
  WebGLRenderer,
} from 'three';
import type { Texture } from 'three';

const STAR_COLORS: ReadonlyArray<readonly [number, number, number]> = [
  [0.62, 0.72, 1.0],  
  [1.0, 1.0, 1.0],    
  [1.0, 0.93, 0.66],  
  [1.0, 0.72, 0.42],  
  [1.0, 0.5, 0.38],   
];
const STAR_WEIGHTS: ReadonlyArray<number> = [0.28, 0.3, 0.2, 0.14, 0.08];
const STAR_SCALE: ReadonlyArray<number> = [1.9, 1.5, 1.15, 0.9, 0.7];

export type SceneStateName = 'terrain' | 'circuit' | 'flow' | 'signal';

const SCENE_ORDER: ReadonlyArray<SceneStateName> = ['terrain', 'circuit', 'flow', 'signal'];

interface SceneMood {
  rgb: readonly [number, number, number];
  opacity: number;
  speed: number;
  softness: number;
  twinkle: number;
  ping?: boolean;
}

const SCENE_MOODS: Record<SceneStateName, SceneMood> = {
  terrain: { rgb: [1, 1, 1], opacity: 1, speed: 1, softness: 0, twinkle: 0 },
  circuit: { rgb: [0.55, 1.05, 0.95], opacity: 0.85, speed: 0.75, softness: 0.35, twinkle: 0.5 },
  flow: { rgb: [1.08, 0.9, 0.62], opacity: 0.55, speed: 0.45, softness: 1, twinkle: -0.4 },
  signal: { rgb: [0.5, 1.1, 1.0], opacity: 0.7, speed: 0.6, softness: 0.55, twinkle: 0.6, ping: true },
};

function isSceneName(v: string | undefined): v is SceneStateName {
  return v !== undefined && (SCENE_ORDER as ReadonlyArray<string>).includes(v);
}

function routeDefault(pathname: string): SceneStateName {
  if (pathname.startsWith('/publications')) return 'flow';
  if (pathname.startsWith('/contact') || pathname.startsWith('/guestbook') || pathname.startsWith('/ai-chatbot')) return 'signal';
  return 'circuit';
}

function pickStarClass(rand: number): number {
  let acc = 0;
  for (let i = 0; i < STAR_WEIGHTS.length; i++) {
    acc += STAR_WEIGHTS[i];
    if (rand <= acc) return i;
  }
  return STAR_WEIGHTS.length - 1;
}

function shouldUseWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.innerWidth < 768) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return false;
  try {
    const test = document.createElement('canvas');
    const gl = test.getContext('webgl2') || test.getContext('webgl');
    if (!gl) return false;
  } catch {
    return false;
  }
  return true;
}

function makeDotTexture(): Texture {
  const S = 64;
  const cv = document.createElement('canvas');
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }
  const tex = new CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

function initEngine(container: HTMLDivElement): () => void {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(
    62,
    window.innerWidth / window.innerHeight,
    0.1,
    400
  );
  camera.position.set(0, 0, 0);

  const COUNT = 2000;
  const DEPTH = 240;          
  const RADIUS = 90;          
  const NEAR = 6;             

  const homeX = new Float32Array(COUNT);
  const homeY = new Float32Array(COUNT);
  const posX = new Float32Array(COUNT);
  const posY = new Float32Array(COUNT);
  const posZ = new Float32Array(COUNT);
  const speed = new Float32Array(COUNT);
  const starClass = new Uint8Array(COUNT);
  const twPhase = new Float32Array(COUNT);
  const repelX = new Float32Array(COUNT);
  const repelY = new Float32Array(COUNT);

  const dotPositions = new Float32Array(COUNT * 3);
  const dotColors = new Float32Array(COUNT * 3);
  const dotSizes = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const r = Math.pow(Math.random(), 0.85) * RADIUS;
    const a = Math.random() * Math.PI * 2;
    homeX[i] = Math.cos(a) * r;
    homeY[i] = Math.sin(a) * r; 
    posZ[i] = -Math.random() * DEPTH;
    speed[i] = 0.6 + Math.random() * 1.4;
    const cls = pickStarClass(Math.random());
    starClass[i] = cls;
    const c = STAR_COLORS[cls];
    dotColors[i * 3] = c[0];
    dotColors[i * 3 + 1] = c[1];
    dotColors[i * 3 + 2] = c[2];
    dotSizes[i] = STAR_SCALE[cls] * (0.9 + Math.random() * 1.0);
    twPhase[i] = Math.random() * Math.PI * 2;
  }

  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute('position', new BufferAttribute(dotPositions, 3));
  dotGeo.setAttribute('color', new BufferAttribute(dotColors, 3));
  dotGeo.setAttribute('size', new BufferAttribute(dotSizes, 1));

  const dotMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTex: { value: null as Texture | null },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSoft: { value: 0 },
      uTwAmp: { value: 0 },
    },
    vertexShader:  `
      attribute float size;
      varying vec3 vColor;
      varying float vTwinkle;
      uniform float uTime;
      uniform float uSoft;
      uniform float uTwAmp;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float tw = 0.82 + (0.18 + uTwAmp) * sin(uTime * 2.2 + position.x * 12.0 + position.y * 7.0 + 0.6);
        vTwinkle = tw;
        gl_PointSize = size * uPixelRatio * tw * mix(1.0, 1.35, uSoft) * (140.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader:  `
      uniform sampler2D uTex;
      uniform float uOpacity;
      uniform float uSoft;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uTex, gl_PointCoord);
        float a = mix(tex.a, max(tex.a, pow(tex.a, 0.45) * 0.6), uSoft);
        gl_FragColor = vec4(vColor, a * vTwinkle * uOpacity);
      }
    `,
    vertexColors: true,
  });
  const dotPoints = new Points(dotGeo, dotMat);
  dotPoints.frustumCulled = false;
  scene.add(dotPoints);

  const streakPositions = new Float32Array(COUNT * 6);
  const streakColors = new Float32Array(COUNT * 6);
  const streakGeo = new BufferGeometry();
  streakGeo.setAttribute('position', new BufferAttribute(streakPositions, 3));
  streakGeo.setAttribute('color', new BufferAttribute(streakColors, 3));
  const streakMat = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const streaks = new LineSegments(streakGeo, streakMat);
  streaks.frustumCulled = false;
  scene.add(streaks);

  let warp = 0;
  let warpDur = 1.4;
  let fade = 0;
  let fadeTarget = 1;
  let panX = 0;          
  let panY = 0;
  let driftVelX = 0;     
  let driftVelY = 0;

  function startBurst(dur: number): void {
    warp = 0;
    warpDur = dur;
    for (let i = 0; i < COUNT; i++) {
      posZ[i] = -DEPTH * (0.55 + Math.random() * 0.45);
      repelX[i] = 0;
      repelY[i] = 0;
    }
  }
  startBurst(1.4); 

  function onPageLoad(): void {
    const ang = Math.random() * Math.PI * 2;
    driftVelX = Math.cos(ang) * 26;
    driftVelY = Math.sin(ang) * 16;
    fadeTarget = 0.25;
    window.setTimeout(() => { fadeTarget = 1; }, 260);
  }
  document.addEventListener('astro:page-load', onPageLoad);

  const dotTexture = makeDotTexture();
  dotMat.uniforms.uTex.value = dotTexture;

  const baseColors = new Float32Array(dotColors);
  const softMult = new Float32Array(COUNT);

  let moodR = 1, moodG = 1, moodB = 1;
  let moodOpacity = 1, moodSpeed = 1, moodSoft = 0, moodTwinkleAmp = 0;
  let moodRt = 1, moodGt = 1, moodBt = 1;
  let moodOpacityT = 1, moodSpeedT = 1, moodSoftT = 0, moodTwinkleAmpT = 0;
  let pingOn = false, pingEnv = 0;

  function bakeMood(rgb: readonly [number, number, number], softness: number): void {
    for (let i = 0; i < COUNT; i++) {
      softMult[i] = 1 - softness * 0.85 * (0.35 + 0.65 * (starClass[i] / (STAR_COLORS.length - 1)));
      dotColors[i * 3] = baseColors[i * 3] * rgb[0] * softMult[i];
      dotColors[i * 3 + 1] = baseColors[i * 3 + 1] * rgb[1] * softMult[i];
      dotColors[i * 3 + 2] = baseColors[i * 3 + 2] * rgb[2] * softMult[i];
    }
    (dotGeo.attributes.color as BufferAttribute).needsUpdate = true;
  }

  const initialSceneName = container.dataset.scene;
  let currentScene: SceneStateName = isSceneName(initialSceneName)
    ? initialSceneName
    : routeDefault(window.location.pathname);

  {
    const m = SCENE_MOODS[currentScene];
    moodR = moodRt = m.rgb[0];
    moodG = moodGt = m.rgb[1];
    moodB = moodBt = m.rgb[2];
    moodOpacity = moodOpacityT = m.opacity;
    moodSpeed = moodSpeedT = m.speed;
    moodSoft = moodSoftT = m.softness;
    moodTwinkleAmp = moodTwinkleAmpT = m.twinkle;
    pingOn = Boolean(m.ping);
    bakeMood(m.rgb, m.softness);
  }

  const sectionEntries = new Map<Element, { rootTop: number }>();
  let targetScene: SceneStateName = currentScene;

  const sceneObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const prev = sectionEntries.get(entry.target);
      if (prev) prev.rootTop = entry.isIntersecting ? entry.boundingClientRect.top : Number.POSITIVE_INFINITY;
    }
    let best: Element | null = null;
    let bestTop = Number.POSITIVE_INFINITY;
    for (const [el, meta] of sectionEntries) {
      if (meta.rootTop < bestTop) { bestTop = meta.rootTop; best = el; }
    }
    const raw = best?.getAttribute('data-scene') ?? undefined;
    const next: SceneStateName = isSceneName(raw) ? raw : routeDefault(window.location.pathname);
    if (next !== targetScene) targetScene = next;
  }, {});

  function scanSceneSections(): void {
    for (const el of Array.from(document.querySelectorAll('[data-scene]'))) {
      if (!sectionEntries.has(el)) {
        sectionEntries.set(el, { rootTop: Number.POSITIVE_INFINITY });
        sceneObserver.observe(el);
      }
    }
    for (const [el] of sectionEntries) {
      if (!document.contains(el)) {
        sceneObserver.unobserve(el);
        sectionEntries.delete(el);
      }
    }
  }

  function onPageLoadScene(): void {
    scanSceneSections();
    targetScene = routeDefault(window.location.pathname);
  }
  document.addEventListener('astro:page-load', onPageLoadScene);
  scanSceneSections();

  const pointer = { x: 0, y: 0 };
  let pointerActive = false;
  function onPointerMove(e: PointerEvent): void {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    pointerActive = true;
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  let scrollVel = 0;
  let lastScrollY = window.scrollY;
  let scrollTicking = false;
  function onScroll(): void {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      scrollVel = Math.min(Math.abs(dy) * 0.02, 3);
      scrollTicking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  function onResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    dotMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  }
  window.addEventListener('resize', onResize);

  let tabVisible = !document.hidden;
  function onVisibility(): void {
    tabVisible = !document.hidden;
  }
  document.addEventListener('visibilitychange', onVisibility);

  const timer = new Timer();
  let rafId = 0;

  const BASE_SPEED = 3.0;     
  const BURST_SPEED = 150;    
  const SCROLL_SPEED = 40;    
  const MOOD_LERP = 1 - Math.pow(0.12, 1 / 60); 

  function render(timestamp?: number): void {
    rafId = requestAnimationFrame(render);
    if (!tabVisible) return;

    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 0.05);
    const time = timer.getElapsed();

    if (targetScene !== currentScene) {
      currentScene = targetScene;
      const m = SCENE_MOODS[currentScene];
      moodRt = m.rgb[0];
      moodGt = m.rgb[1];
      moodBt = m.rgb[2];
      moodOpacityT = m.opacity;
      moodSpeedT = m.speed;
      moodSoftT = m.softness;
      moodTwinkleAmpT = m.twinkle;
      pingOn = Boolean(m.ping);
      container.dataset.scene = currentScene;
    }
    const moodK = 1 - Math.pow(1 - MOOD_LERP, dt * 60);
    moodR += (moodRt - moodR) * moodK;
    moodG += (moodGt - moodG) * moodK;
    moodB += (moodBt - moodB) * moodK;
    moodOpacity += (moodOpacityT - moodOpacity) * moodK;
    moodSpeed += (moodSpeedT - moodSpeed) * moodK;
    moodSoft += (moodSoftT - moodSoft) * moodK;
    moodTwinkleAmp += (moodTwinkleAmpT - moodTwinkleAmp) * moodK;
    const tintDelta = Math.abs(moodRt - moodR) + Math.abs(moodGt - moodG) + Math.abs(moodBt - moodB);
    if (tintDelta > 0.003) {
      for (let i = 0; i < COUNT * 3; i++) {
        dotColors[i] = baseColors[i] * ((i % 3 === 0) ? moodR : (i % 3 === 1) ? moodG : moodB) * softMult[Math.floor(i / 3)];
      }
      (dotGeo.attributes.color as BufferAttribute).needsUpdate = true;
    }
    pingEnv = pingOn ? Math.max(0, Math.sin(time * 1.4) - 0.62) * 2.6 * moodK + pingEnv * (1 - moodK) : pingEnv * 0.9;

    if (warp < 1) {
      warp = Math.min(warp + dt / warpDur, 1);
    }
    fade += (fadeTarget - fade) * 0.08;

    scrollVel *= 0.92;
    panX += driftVelX * dt;
    panY += driftVelY * dt;
    driftVelX *= Math.pow(0.05, dt);
    driftVelY *= Math.pow(0.05, dt);
    panX *= Math.pow(0.2, dt);
    panY *= Math.pow(0.2, dt);

    const warpEase = easeOutCubic(1 - warp); 
    const forward = moodSpeed * BASE_SPEED + BURST_SPEED * warpEase + SCROLL_SPEED * scrollVel;

    const repelWorldX = pointer.x * 30;
    const repelWorldY = pointer.y * 18;

    let posIdx = 0;
    let strIdx = 0;
    const streakActive = forward > 14;

    for (let i = 0; i < COUNT; i++) {
      posZ[i] += forward * speed[i] * dt;
      if (posZ[i] > NEAR) {
        posZ[i] -= DEPTH + NEAR;
        repelX[i] = 0;
        repelY[i] = 0;
      }

      if (pointerActive) {
        const dx = homeX[i] + repelX[i] - repelWorldX;
        const dy = homeY[i] + repelY[i] - repelWorldY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120) {
          const d = Math.sqrt(d2) || 0.001;
          const force = (1 - d / 11) * 6;
          repelX[i] += (dx / d) * force * dt * 10;
          repelY[i] += (dy / d) * force * dt * 10;
        }
        repelX[i] *= 0.92;
        repelY[i] *= 0.92;
      }

      const expand = 0.12 + 0.88 * easeOutCubic(warp);
      posX[i] = (homeX[i] + repelX[i]) * expand + panX;
      posY[i] = (homeY[i] + repelY[i]) * expand + panY;

      dotPositions[posIdx] = posX[i];
      dotPositions[posIdx + 1] = posY[i];
      dotPositions[posIdx + 2] = posZ[i];
      posIdx += 3;

      if (streakActive) {
        const tail = Math.min((forward - 12) * 0.06, 6) * speed[i];
        const c = STAR_COLORS[starClass[i]];
        streakPositions[strIdx] = posX[i];
        streakPositions[strIdx + 1] = posY[i];
        streakPositions[strIdx + 2] = posZ[i];
        streakPositions[strIdx + 3] = posX[i];
        streakPositions[strIdx + 4] = posY[i];
        streakPositions[strIdx + 5] = posZ[i] - tail;
        streakColors[strIdx] = c[0];
        streakColors[strIdx + 1] = c[1];
        streakColors[strIdx + 2] = c[2];
        streakColors[strIdx + 3] = c[0] * 0.05;
        streakColors[strIdx + 4] = c[1] * 0.05;
        streakColors[strIdx + 5] = c[2] * 0.05;
      }
      strIdx += 6;
    }

    (dotGeo.attributes.position as BufferAttribute).needsUpdate = true;
    (streakGeo.attributes.position as BufferAttribute).needsUpdate = true;
    (streakGeo.attributes.color as BufferAttribute).needsUpdate = true;

    const streakTarget = streakActive ? Math.min((forward - 12) / 30, 0.8) : 0;
    streakMat.opacity += (streakTarget - streakMat.opacity) * 0.2;

    dotMat.uniforms.uTime.value = time;
    dotMat.uniforms.uSoft.value = moodSoft;
    dotMat.uniforms.uTwAmp.value = moodTwinkleAmp;
    dotMat.uniforms.uOpacity.value = fade * moodOpacity * (0.45 + 0.55 * easeOutCubic(warp)) * (1 + pingEnv * 0.6);

    camera.position.x += (pointer.x * 3 + panX - camera.position.x) * 0.06;
    camera.position.y += (pointer.y * 2 + panY - camera.position.y) * 0.04;
    camera.lookAt(panX * 0.6, panY * 0.6, -50);

    renderer.render(scene, camera);
  }

  render();

  return () => {
    cancelAnimationFrame(rafId);
    document.removeEventListener('astro:page-load', onPageLoad);
    document.removeEventListener('astro:page-load', onPageLoadScene);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    sceneObserver.disconnect();

    dotGeo.dispose();
    dotTexture.dispose();
    dotMat.dispose();
    streakGeo.dispose();
    streakMat.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}

export function GlobalScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!shouldUseWebGL()) {
      container.classList.add('scene-fallback');
      return;
    }

    let cleanup: (() => void) | undefined;

    try {
      cleanup = initEngine(container);
    } catch {
      container.classList.add('scene-fallback');
    }

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="global-scene"
      aria-hidden="true"
      className="scene-layer pointer-events-none fixed inset-0 z-0 hidden select-none md:block"
    />
  );
}
