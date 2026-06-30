import { Link } from "react-router";
import { usePageContent } from "@/react-app/hooks/usePageContent";

export default function CTASection() {
  const { get } = usePageContent();

  const ctaHeadline = get("home_cta_headline", "Ready for");
  const ctaHeadlineAccent = get("home_cta_headline_accent", "Something Sweet?");
  const ctaDescription = get(
    "home_cta_description",
    "Tell us your vision — flavor, theme, occasion. Every order is personal, every bite is unforgettable."
  );

  return (
    <section className="py-28 px-6 lg:px-16 bg-white text-center relative overflow-hidden">
      {/* Watermark Background */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[180px] md:text-[220px] font-bold text-light-gray whitespace-nowrap pointer-events-none select-none tracking-tighter">
        SWEET
      </span>

      {/* Content */}
      <div className="relative z-10">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-none mb-4">
          {ctaHeadline}{" "}
          <em className="italic font-light text-gold-slide">{ctaHeadlineAccent}</em>
        </h2>
        <p className="text-sm leading-[1.9] text-gray max-w-md mx-auto mb-11">
          {ctaDescription}
        </p>

        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Link
            to="/order"
            className="btn-gold text-white text-xs font-medium tracking-[0.2em] uppercase px-9 py-4 hover:-translate-y-0.5 transition-transform"
          >
            Start Your Order
          </Link>
          <Link
            to="/gallery"
            className="text-xs font-normal tracking-[0.15em] uppercase text-charcoal border-b border-black/25 pb-0.5 hover:text-gold-deep hover:border-gold transition-colors"
          >
            Browse the Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
