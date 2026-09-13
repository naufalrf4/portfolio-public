

export function HeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {}
      <div className="hero-dot-grid absolute inset-0" />

      {}
      <div className="hero-glow-a absolute left-[8%] top-[12%] h-[44vh] w-[44vh] rounded-full" />
      <div className="hero-glow-b absolute bottom-[8%] right-[6%] h-[36vh] w-[36vh] rounded-full" />

      {}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent" />
    </div>
  );
}
