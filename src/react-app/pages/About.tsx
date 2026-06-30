import Navbar from "@/react-app/components/layout/Navbar";
import Footer from "@/react-app/components/layout/Footer";
import { useSiteImages } from "@/react-app/hooks/useSiteImages";
import { usePageContent } from "@/react-app/hooks/usePageContent";

export default function AboutPage() {
  const { images } = useSiteImages();
  const { get } = usePageContent();
  const mainImage = images.about_main;

  const headline = get("about_headline", "Meet Erica");
  const subtitle = get("about_subtitle", "Baker, artist, and the heart behind every creation");
  const storyTitle = get("about_story_title", "From Home Kitchen to Something Sweet");
  const storyParagraph1 = get("about_story_p1", "What started as a way to bring joy to friends and family has grown into a passion I get to share with my community every single day. I'm Erica, and I've been baking since I could reach the counter with a step stool.");
  const storyParagraph2 = get("about_story_p2", "After years of creating cakes for birthdays, weddings, and \"just because\" moments, I realized that the magic wasn't just in the flavors—it was in the smiles. There's nothing quite like watching someone's face light up when they see a cake made just for them.");
  const storyParagraph3 = get("about_story_p3", "In 2019, I officially launched Something Sweet by Erica with a simple mission: create beautiful, delicious treats that make every celebration feel extraordinary. Every order is handcrafted with care, quality ingredients, and a whole lot of love.");
  const quote = get("about_quote", "Every celebration deserves something sweet—something made with intention, care, and a little bit of magic.");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Header */}
      <header className="bg-black py-12 sm:py-20 px-5 sm:px-6 lg:px-16 relative overflow-hidden">
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

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block text-[10px] font-medium tracking-[0.4em] uppercase text-gold-mid mb-4">
            The Story Behind the Sweets
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {headline.includes("Erica") ? (
              <>Meet <em className="italic font-light text-gold-slide">Erica</em></>
            ) : (
              headline
            )}
          </h1>
          <p className="text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </header>

      {/* Main Story Section */}
      <section className="py-12 sm:py-20 px-5 sm:px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] bg-off-white border border-light-gray overflow-hidden">
                {mainImage ? (
                  <img
                    src={mainImage.url}
                    alt={mainImage.alt_text || "Erica"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-pale to-off-white">
                    <span className="text-8xl">👩‍🍳</span>
                  </div>
                )}
              </div>
              {/* Decorative frame */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-gold/30 -z-10" />
            </div>

            {/* Story */}
            <div>
              <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-4 block">
                My Story
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-black mb-4 sm:mb-6">
                {storyTitle.includes("Something Sweet") ? (
                  <>From Home Kitchen to <br /><span className="italic font-light">Something Sweet</span></>
                ) : (
                  storyTitle
                )}
              </h2>
              <div className="space-y-4 text-sm text-gray leading-relaxed">
                <p>{storyParagraph1}</p>
                <p>{storyParagraph2}</p>
                <p>{storyParagraph3}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-20 px-5 sm:px-6 lg:px-16 bg-off-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-3 block">
              What I Believe In
            </span>
            <h2 className="font-display text-3xl font-semibold text-black">
              The <em className="italic font-light">Something Sweet</em> Promise
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: "✨",
                title: "Handcrafted Care",
                desc: "Every single item is made by hand, from scratch, using time-honored techniques. No shortcuts, no mass production—just me, my kitchen, and your special order.",
              },
              {
                icon: "🌾",
                title: "Quality Ingredients",
                desc: "Real butter, pure vanilla, farm-fresh eggs, and premium chocolate. I source the best ingredients because you deserve treats that taste as good as they look.",
              },
              {
                icon: "💛",
                title: "Made with Love",
                desc: "This isn't just a business—it's my passion. I pour my heart into every creation because I know it's going to be part of your special moment.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-white p-5 sm:p-8 border border-light-gray text-center"
              >
                <span className="text-3xl sm:text-4xl block mb-3 sm:mb-4">{value.icon}</span>
                <h3 className="font-display text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">
                  {value.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Facts Section */}
      <section className="py-12 sm:py-20 px-5 sm:px-6 lg:px-16 bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-mid mb-3 block">
              A Little More About Me
            </span>
            <h2 className="font-display text-3xl font-semibold text-white">
              The <em className="italic font-light text-gold-slide">Baker</em> Behind the Apron
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Cakes Baked", value: "500+" },
              { label: "Happy Customers", value: "300+" },
              { label: "Years Baking", value: "12+" },
              { label: "Cups of Coffee", value: "∞" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-4 sm:py-6">
                <span className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gold-slide block mb-1 sm:mb-2">
                  {stat.value}
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-white/50">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
              <div>
                <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-gold-mid mb-3">
                  Favorite Flavor to Make
                </h4>
                <p className="text-white/70 text-sm">
                  Red velvet with cream cheese frosting. It's a classic for a reason!
                </p>
              </div>
              <div>
                <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-gold-mid mb-3">
                  Secret Ingredient
                </h4>
                <p className="text-white/70 text-sm">
                  A pinch of patience and a whole lot of love (okay, and really good vanilla).
                </p>
              </div>
              <div>
                <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-gold-mid mb-3">
                  When I'm Not Baking
                </h4>
                <p className="text-white/70 text-sm">
                  You'll find me testing new recipes, browsing farmers markets, or enjoying 
                  quality time with family.
                </p>
              </div>
              <div>
                <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-gold-mid mb-3">
                  Dream Cake to Make
                </h4>
                <p className="text-white/70 text-sm">
                  A five-tier wedding cake covered in hand-painted sugar flowers. One day!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-12 sm:py-20 px-5 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-4xl sm:text-6xl text-gold-mid block mb-4 sm:mb-6">"</span>
          <blockquote className="font-display text-xl sm:text-2xl md:text-3xl font-light text-black italic leading-relaxed mb-4 sm:mb-6">
            {quote}
          </blockquote>
          <cite className="text-[10px] sm:text-[11px] font-medium tracking-[0.3em] uppercase text-gold-deep not-italic">
            — Erica
          </cite>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-16 bg-off-white border-t border-light-gray">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-black mb-3 sm:mb-4">
            Let's Create Something <em className="italic font-light">Sweet</em>
          </h3>
          <p className="text-[13px] sm:text-sm text-gray mb-6 sm:mb-8 leading-relaxed">
            Ready to place an order? I'd love to be part of your next celebration.
          </p>
          <a
            href="/order"
            className="btn-gold inline-block text-white text-xs font-medium tracking-[0.2em] uppercase px-8 sm:px-10 py-3.5 sm:py-4 hover:-translate-y-0.5 transition-transform"
          >
            <span>Start Your Order</span>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
