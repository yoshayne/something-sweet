import { useState } from "react";
import Navbar from "@/react-app/components/layout/Navbar";
import Footer from "@/react-app/components/layout/Footer";
import GalleryGrid from "@/react-app/components/gallery/GalleryGrid";
import { categories, type GalleryCategory } from "@/data/gallery";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Header */}
      <header className="bg-black py-12 sm:py-20 px-5 sm:px-6 lg:px-16 relative overflow-hidden">
        {/* Diagonal pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 30px,
              rgba(201,146,14,0.08) 30px,
              rgba(201,146,14,0.08) 31px
            )`,
          }}
        />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="inline-block text-[10px] font-medium tracking-[0.4em] uppercase text-gold-mid mb-4">
            Our Portfolio
          </span>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            The <em className="italic font-light text-gold-slide">Gallery</em>
          </h1>
          <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            Every creation tells a story. Browse our collection of custom cakes, 
            cupcakes, and cookies — each one handcrafted with love.
          </p>
        </div>
      </header>

      {/* Category Filters */}
      <nav className="sticky top-[64px] sm:top-[76px] z-40 bg-white border-b border-light-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16 py-3 sm:py-5 overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-medium tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all duration-300 whitespace-nowrap ${
                  activeCategory === cat.value
                    ? "bg-black text-white"
                    : "bg-transparent text-charcoal hover:bg-light-gray"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Gallery Grid */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-16 bg-off-white">
        <GalleryGrid activeCategory={activeCategory} />
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-5 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2.5 text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-6">
            <span className="w-8 h-px animate-gold-slide" />
            Ready to Order?
            <span className="w-8 h-px animate-gold-slide" />
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-black mb-4">
            Let's Create Something{" "}
            <em className="italic font-light text-gold-slide">Sweet</em>
          </h2>
          <p className="text-sm text-gray leading-relaxed mb-8">
            Every order is custom made just for you. Share your vision and 
            we'll bring it to life — one delicious detail at a time.
          </p>
          <a
            href="/order"
            className="btn-gold inline-block text-white text-xs font-medium tracking-[0.2em] uppercase px-10 py-4 hover:-translate-y-0.5 transition-transform"
          >
            <span>Start Your Order</span>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
