import { Link } from "react-router";
import { useSiteImages } from "@/react-app/hooks/useSiteImages";
import { usePageContent } from "@/react-app/hooks/usePageContent";

export default function HeroSection() {
  const { images } = useSiteImages();
  const { get } = usePageContent();
  const heroImage = images.homepage_hero;

  const headline = get("home_hero_headline", "Baked Fresh.");
  const headlineAccent = get("home_hero_headline_accent", "Made for You.");
  const description = get(
    "home_hero_description",
    "Custom cakes, cookies & cupcakes designed around your vision. Every order is one of a kind — because you deserve more than ordinary."
  );

  return (
    <section className="min-h-[calc(100vh-108px)] lg:grid lg:grid-cols-2 bg-white">
      {/* Left: Text Content */}
      <div className="px-5 sm:px-6 lg:px-16 py-12 sm:py-16 lg:py-20 flex flex-col justify-center relative">
        {/* Gold vertical rule on right (desktop only) */}
        <div className="hidden lg:block absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

        {/* Chip Badge */}
        <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-gold-pale border border-gold/25 px-3 sm:px-4 py-1.5 mb-6 sm:mb-9 w-fit animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-gold-gradient" />
          <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gold-deep">
            Custom · Made to Order · Handcrafted
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] text-black animate-fade-up" style={{ animationDelay: "0.4s" }}>
          {headline}
          <br />
          <em className="italic font-light text-gold-slide block text-[1.12em] leading-tight">
            {headlineAccent}
          </em>
        </h1>

        {/* Description */}
        <p className="text-sm font-light leading-[1.9] text-gray max-w-[400px] mt-5 sm:mt-7 mb-8 sm:mb-11 animate-fade-up" style={{ animationDelay: "0.6s" }}>
          {description}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 items-center animate-fade-up" style={{ animationDelay: "0.75s" }}>
          <Link
            to="/order"
            className="btn-gold text-white text-xs font-medium tracking-[0.2em] uppercase px-7 sm:px-9 py-3.5 sm:py-4 hover:-translate-y-0.5 transition-transform"
          >
            Place Your Order
          </Link>
          <Link
            to="/gallery"
            className="text-xs font-normal tracking-[0.15em] uppercase text-charcoal border-b border-black/25 pb-0.5 hover:text-gold-deep hover:border-gold transition-colors"
          >
            See the Work
          </Link>
        </div>

        {/* Trust Stats */}
        <div className="flex gap-6 sm:gap-8 mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-light-gray animate-fade-up" style={{ animationDelay: "0.9s" }}>
          {[
            { num: "100+", label: "Cakes Made" },
            { num: "5★", label: "Reviews" },
            { num: "0%", label: "Generic" },
          ].map((stat) => (
            <div key={stat.label}>
              <span className="font-display text-2xl sm:text-3xl font-semibold text-gold-slide block leading-none mb-1">
                {stat.num}
              </span>
              <span className="text-[10px] sm:text-[11px] font-light tracking-[0.15em] uppercase text-gray">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Featured Image */}
      <div className="lg:hidden bg-light-gray relative overflow-hidden h-[280px] sm:h-[340px]">
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 24px,
              rgba(201,146,14,0.04) 24px,
              rgba(201,146,14,0.04) 25px
            )`,
          }}
        />
        {heroImage ? (
          <img
            src={heroImage.url}
            alt={heroImage.alt_text || "Featured cake"}
            className="absolute inset-0 w-full h-full object-cover drop-shadow-[0_12px_40px_rgba(201,146,14,0.25)] animate-float-subtle"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] rounded-full bg-gradient-radial from-gold-bright/20 via-gold/10 to-transparent animate-pulse-glow" />
            <div className="text-[80px] sm:text-[100px] relative z-10 drop-shadow-[0_12px_40px_rgba(201,146,14,0.25)] animate-float">
              🎂
            </div>
          </div>
        )}
      </div>

      {/* Right: Visual Panel (Desktop) */}
      <div className="hidden lg:flex flex-col bg-light-gray relative overflow-hidden">
        {/* Diagonal stripe pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 24px,
              rgba(201,146,14,0.04) 24px,
              rgba(201,146,14,0.04) 25px
            )`,
          }}
        />

        {/* This Week Badge */}
        <div className="absolute top-7 right-7 bg-black p-3.5 text-center z-10">
          <span className="text-[8px] font-medium tracking-[0.3em] uppercase text-gold-mid block mb-1">
            This Week
          </span>
          <span className="font-display text-[15px] font-semibold text-white block leading-tight">
            Black Gold
            <br />
            Birthday Cake
          </span>
        </div>

        {/* Cake Image Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Cake image or emoji placeholder */}
          {heroImage ? (
            <img
              src={heroImage.url}
              alt={heroImage.alt_text || "Featured cake"}
              className="absolute inset-0 w-full h-full object-cover drop-shadow-[0_12px_40px_rgba(201,146,14,0.25)] animate-float-subtle"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[340px] h-[340px] rounded-full bg-gradient-radial from-gold-bright/20 via-gold/10 to-transparent animate-pulse-glow" />
              <div className="text-[110px] relative z-10 drop-shadow-[0_12px_40px_rgba(201,146,14,0.25)] animate-float">
                🎂
              </div>
            </div>
          )}
        </div>

        {/* Bottom Strip */}
        <div className="bg-black px-8 py-5 flex items-center justify-between">
          <span className="font-display italic text-base text-white/70">
            Something Sweet by Erica
          </span>
          <Link
            to="/gallery"
            className="text-[10px] font-medium tracking-[0.25em] uppercase text-gold-slide border-b border-gold pb-px hover:opacity-70 transition-opacity"
          >
            View Gallery →
          </Link>
        </div>
      </div>
    </section>
  );
}
