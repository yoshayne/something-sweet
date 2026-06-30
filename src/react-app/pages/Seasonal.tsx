import Navbar from "@/react-app/components/layout/Navbar";
import Footer from "@/react-app/components/layout/Footer";
import { seasonalItems, upcomingSpecials, currentSeason } from "@/data/seasonalSpecials";

export default function SeasonalPage() {
  const featuredItem = seasonalItems.find((item) => item.category === "featured");
  const seasonalTreats = seasonalItems.filter((item) => item.category === "seasonal");
  const holidayTreats = seasonalItems.filter((item) => item.category === "holiday");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Header */}
      <header className="bg-black py-12 sm:py-16 px-5 sm:px-6 lg:px-16 relative overflow-hidden">
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
            Limited Time Only
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {currentSeason} <em className="italic font-light text-gold-slide">Specials</em>
          </h1>
          <p className="text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
            Seasonal flavors and holiday treats made for a limited time. 
            Order early — these go fast!
          </p>
        </div>
      </header>

      {/* Featured Special */}
      {featuredItem && (
        <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-16 bg-off-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center">
              <div className="relative">
                <div className="aspect-square bg-white border border-light-gray overflow-hidden">
                  <img
                    src={featuredItem.image}
                    alt={featuredItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-4 left-4 bg-gold-deep text-white text-[10px] font-medium tracking-[0.2em] uppercase px-4 py-2">
                  Featured
                </div>
              </div>

              <div>
                <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-3 block">
                  ★ {currentSeason} Highlight
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-black mb-4">
                  {featuredItem.name}
                </h2>
                <p className="text-sm text-gray leading-relaxed mb-6">
                  {featuredItem.description}
                </p>
                <div className="flex items-center gap-6 mb-8">
                  <span className="font-display text-2xl font-semibold text-black">
                    {featuredItem.price}
                  </span>
                  {featuredItem.availableUntil && (
                    <span className="text-xs text-gray">
                      Available until {featuredItem.availableUntil}
                    </span>
                  )}
                </div>
                <a
                  href="/order"
                  className="btn-gold inline-block text-white text-xs font-medium tracking-[0.2em] uppercase px-8 py-4 hover:-translate-y-0.5 transition-transform"
                >
                  <span>Order Now</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seasonal Treats */}
      <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-3 block">
              Fresh & Seasonal
            </span>
            <h2 className="font-display text-3xl font-semibold text-black">
              {currentSeason} <em className="italic font-light">Flavors</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {seasonalTreats.map((item) => (
              <article key={item.id} className="group">
                <div className="aspect-square bg-off-white border border-light-gray overflow-hidden mb-3 sm:mb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-display text-sm sm:text-lg font-semibold text-black mb-1 sm:mb-2">
                  {item.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray leading-relaxed mb-2 sm:mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-display text-xs sm:text-sm font-semibold text-black">
                    {item.price}
                  </span>
                  {item.availableUntil && (
                    <span className="text-[9px] sm:text-[10px] text-gold-deep">
                      Until {item.availableUntil}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Holiday Specials */}
      {holidayTreats.length > 0 && (
        <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-16 bg-black">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-mid mb-3 block">
                Celebrate in Style
              </span>
              <h2 className="font-display text-3xl font-semibold text-white">
                Holiday <em className="italic font-light text-gold-slide">Treats</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-8">
              {holidayTreats.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-4 sm:gap-5 bg-white/5 border border-white/10 p-4 sm:p-5"
                >
                  <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-white/10 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base sm:text-lg font-semibold text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-display text-sm font-semibold text-gold-mid">
                        {item.price}
                      </span>
                      {item.availableUntil && (
                        <span className="text-[9px] sm:text-[10px] text-white/40">
                          Order by {item.availableUntil}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon */}
      <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-16 bg-off-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold-deep mb-3 block">
              Mark Your Calendar
            </span>
            <h2 className="font-display text-3xl font-semibold text-black">
              Coming <em className="italic font-light">Soon</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-8">
            {upcomingSpecials.map((preview) => (
              <div
                key={preview.season}
                className="bg-white p-5 sm:p-8 border border-light-gray"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-5 flex-wrap gap-2">
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-black">
                    {preview.season}
                  </h3>
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-gold-deep">
                    {preview.availableFrom}
                  </span>
                </div>
                <ul className="space-y-2 columns-1 sm:columns-2">
                  {preview.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-[13px] sm:text-sm text-gray break-inside-avoid"
                    >
                      <span className="text-gold-mid">◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-16 bg-white border-t border-light-gray">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-2xl sm:text-3xl block mb-3 sm:mb-4">📧</span>
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-black mb-2 sm:mb-3">
            Don't Miss a <em className="italic font-light">Special</em>
          </h3>
          <p className="text-[13px] sm:text-sm text-gray mb-5 sm:mb-6 leading-relaxed">
            Join the mailing list to be the first to know when new seasonal treats drop.
          </p>
          <a
            href="/"
            className="text-xs font-medium tracking-[0.2em] uppercase text-gold-deep hover:text-black transition-colors"
          >
            Sign Up for Updates →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
