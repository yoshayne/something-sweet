import { Link } from "react-router";
import { useSiteImages } from "@/react-app/hooks/useSiteImages";
import { usePageContent } from "@/react-app/hooks/usePageContent";

export default function SpecialSection() {
  const { images } = useSiteImages();
  const { get } = usePageContent();
  const specialImage = images.homepage_special;

  const specialTitle = get("home_special_title", "Black Gold Birthday Cake");
  const specialSubtitle = get("home_special_subtitle", "A showstopper for any occasion");
  const specialDescription = get(
    "home_special_description",
    "Layered cake finished in matte black buttercream with gold drip, edible gold leaf accents & a custom number topper. Available in any flavor — serves 10 to 50+. Order by Thursday for weekend pickup."
  );

  return (
    <section id="special" className="py-24 px-6 lg:px-16 bg-off-white relative">
      {/* Section Label */}
      <div className="flex items-center gap-3.5 mb-2.5">
        <div className="w-7 h-px animate-gold-slide" />
        <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-gold-deep">
          Updated Every Week
        </span>
      </div>

      {/* Heading */}
      <h2 className="font-display text-4xl md:text-5xl font-semibold text-black leading-[1.05] mb-14">
        This Week's <em className="italic font-light text-gold-slide">Special</em>
      </h2>

      {/* Special Card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-0.5 border border-black/8 overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.06)]">
        {/* Image Side */}
        <div className="relative min-h-[420px] bg-gradient-to-br from-[#1a1a1a] to-charcoal flex items-center justify-center overflow-hidden">
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_40%,rgba(245,200,66,0.12)_0%,transparent_65%)]" />
          {/* This Week Tag */}
          <div className="absolute top-0 left-0 animate-gold-slide text-black text-[9px] font-semibold tracking-[0.3em] uppercase px-5 py-2">
            This Week Only
          </div>
          {/* Special image or emoji placeholder */}
          {specialImage ? (
            <img
              src={specialImage.url}
              alt={specialImage.alt_text || "This week's special"}
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
          ) : (
            <span className="text-8xl relative z-10">🎂</span>
          )}
        </div>

        {/* Info Side */}
        <div className="bg-white p-10 lg:p-12 flex flex-col justify-center border-l border-black/6">
          <div className="font-display text-3xl font-semibold text-black leading-tight mb-1.5">
            {specialTitle}
          </div>
          <div className="font-display italic text-lg font-light text-gold-slide mb-6">
            {specialSubtitle}
          </div>
          <p className="text-[13px] leading-[2] text-gray mb-8">
            {specialDescription}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-9">
            {["Custom Flavors", "Gold Drip", "Any Size", "Weekend Pickup"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-normal tracking-[0.15em] uppercase text-gold-deep bg-gold-pale border border-gold/20 px-3.5 py-1.5"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <Link
            to="/order"
            className="btn-gold text-white text-xs font-medium tracking-[0.2em] uppercase px-9 py-4 hover:-translate-y-0.5 transition-transform w-fit"
          >
            <span>Order This Design</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
