import { useState } from "react";
import Navbar from "@/react-app/components/layout/Navbar";
import Footer from "@/react-app/components/layout/Footer";
import CakeForm from "@/react-app/components/order/CakeForm";
import CupcakeForm from "@/react-app/components/order/CupcakeForm";
import CookieForm from "@/react-app/components/order/CookieForm";

type OrderTab = "cakes" | "cupcakes" | "cookies";

const tabs: { value: OrderTab; label: string; emoji: string }[] = [
  { value: "cakes", label: "Custom Cakes", emoji: "🎂" },
  { value: "cupcakes", label: "Cupcakes", emoji: "🧁" },
  { value: "cookies", label: "Cookies", emoji: "🍪" },
];

export default function OrderPage() {
  const [activeTab, setActiveTab] = useState<OrderTab>("cakes");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Header */}
      <header className="bg-black py-10 sm:py-16 px-5 sm:px-6 lg:px-16 relative overflow-hidden">
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
            Start Your Order
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Place an <em className="italic font-light text-gold-slide">Order</em>
          </h1>
          <p className="text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
            Every order is custom made. Fill out the form below and I'll follow up 
            with a quote within 24-48 hours. Minimum 5-day notice required.
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[64px] sm:top-[76px] z-40 bg-white border-b border-light-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 py-3 sm:py-5 text-center transition-all duration-300 relative ${
                  activeTab === tab.value
                    ? "text-black"
                    : "text-gray hover:text-charcoal"
                }`}
              >
                <span className="text-xl sm:text-2xl block mb-0.5 sm:mb-1">{tab.emoji}</span>
                <span className="text-[9px] sm:text-[11px] font-medium tracking-[0.1em] sm:tracking-[0.15em] uppercase">
                  {tab.label}
                </span>
                {activeTab === tab.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 animate-gold-slide" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Form Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-16 bg-off-white">
        <div className="max-w-4xl mx-auto">
          {activeTab === "cakes" && <CakeForm />}
          {activeTab === "cupcakes" && <CupcakeForm />}
          {activeTab === "cookies" && <CookieForm />}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-10 sm:py-16 px-5 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: "📅",
                title: "Advance Notice",
                desc: "Minimum 5 days for standard orders. 2+ weeks for elaborate designs.",
              },
              {
                icon: "💳",
                title: "Payment",
                desc: "50% deposit required to confirm. Balance due before pickup.",
              },
              {
                icon: "📍",
                title: "Pickup Only",
                desc: "All orders are pickup only. Delivery available for large orders.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-4 sm:p-6 bg-off-white border border-light-gray"
              >
                <span className="text-2xl sm:text-3xl block mb-2 sm:mb-3">{item.icon}</span>
                <h3 className="font-display text-base sm:text-lg font-semibold text-black mb-1 sm:mb-2">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
