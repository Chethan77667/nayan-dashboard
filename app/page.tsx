import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";
import HeroTitle from "@/components/HeroTitle";
import NayanRLogo from "@/components/NayanRLogo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-white">
      <AnimatedHeroBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="animate-hero-header flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
          <div className="animate-hero-logo">
            <NayanRLogo href="/" variant="light" size="md" showText={false} />
          </div>
          <nav className="animate-hero-nav flex gap-2 sm:gap-3">
            <Link
              href="/signin"
              className="rounded-lg px-4 py-2 text-sm font-medium transition duration-300 hover:bg-white/10 hover:scale-105"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-md transition duration-300 hover:scale-105 hover:bg-indigo-50 hover:shadow-lg"
            >
              Sign Up
            </Link>
          </nav>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:px-6">
          <HeroTitle />
          <p className="animate-hero-text mt-8 max-w-2xl text-base leading-relaxed text-indigo-100 sm:text-lg md:text-xl">
            Technology is changing the way businesses operate. Companies that adapt
            digitally become stronger, faster, and more successful. NayanDigital is built
            to turn your vision into success through intelligent business solutions,
            seamless automation, and all-in-one management designed for the modern digital
            era.
          </p>
          <div className="animate-hero-cta mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition duration-300 hover:scale-105 hover:bg-indigo-50 hover:shadow-xl"
            >
              Get started
            </Link>
            <Link
              href="/signin"
              className="rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold backdrop-blur-sm transition duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </main>

        <footer className="animate-hero-footer py-6 text-center text-sm font-medium text-indigo-200">
          Digital Solutions for Smart Business
        </footer>
      </div>
    </div>
  );
}
