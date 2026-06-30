const steps = [
  {
    num: "01",
    icon: "📋",
    title: "Place Your Order",
    desc: "Fill out our simple form — flavor, theme, size, date needed. No back and forth. We get everything upfront.",
  },
  {
    num: "02",
    icon: "✉️",
    title: "Receive Your Invoice",
    desc: "Erica reviews your order and sends you a professional invoice with a secure payment link directly to your email.",
  },
  {
    num: "03",
    icon: "💳",
    title: "Pay Securely",
    desc: "Click your link, review your order, and pay right on the site. Fast, safe, and simple — no apps needed.",
  },
  {
    num: "04",
    icon: "🎂",
    title: "Pick Up & Enjoy",
    desc: "Your creation is crafted with love and ready for pickup on your date. Sit back and enjoy the magic. 👑",
  },
];

export default function ProcessSection() {
  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6 lg:px-16 bg-black relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-[50%] bg-[radial-gradient(ellipse,rgba(201,146,14,0.07)_0%,transparent_65%)] pointer-events-none" />

      {/* Section Label */}
      <div className="flex items-center gap-3.5 mb-2.5 relative z-10">
        <div className="w-7 h-px animate-gold-slide" />
        <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-gold-mid">
          Simple & Seamless
        </span>
      </div>

      {/* Heading */}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-[1.05] mb-10 sm:mb-16 relative z-10">
        How It <em className="italic font-light text-gold-slide">Works</em>
      </h2>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/10 border border-black/10 relative z-10">
        {steps.map((step, index) => (
          <div
            key={step.num}
            className="bg-white px-5 sm:px-8 py-7 sm:py-10 relative transition-colors hover:bg-cream group"
          >
            {/* Number */}
            <div className="font-display text-4xl sm:text-6xl font-light leading-none mb-2 sm:mb-3 bg-gradient-to-br from-gold to-gold-bright bg-clip-text text-transparent">
              {step.num}
            </div>

            {/* Icon */}
            <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">{step.icon}</span>

            {/* Title */}
            <div className="font-display text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3">
              {step.title}
            </div>

            {/* Description */}
            <p className="text-[13px] sm:text-sm leading-[1.85] text-charcoal/80">{step.desc}</p>

            {/* Arrow connector (not on last item) */}
            {index < steps.length - 1 && (
              <span className="hidden lg:block absolute -right-3.5 top-10 text-lg text-gold-slide z-10">
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
