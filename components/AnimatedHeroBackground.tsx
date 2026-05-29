export default function AnimatedHeroBackground() {
  return (
    <div className="hero-bg" aria-hidden>
      <div className="hero-bg-gradient" />
      <div className="hero-bg-orb hero-bg-orb-1" />
      <div className="hero-bg-orb hero-bg-orb-2" />
      <div className="hero-bg-orb hero-bg-orb-3" />

      {/* Floating balls */}
      <div className="hero-ball hero-ball-1" />
      <div className="hero-ball hero-ball-2" />
      <div className="hero-ball hero-ball-3" />
      <div className="hero-ball hero-ball-4" />
      <div className="hero-ball hero-ball-5" />

      <div className="hero-bg-shine" />
      <div className="hero-bg-grid" />
    </div>
  );
}
