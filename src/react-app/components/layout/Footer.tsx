import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-black pt-[72px] px-6 lg:px-16 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-14 border-b border-white/7">
        {/* Brand Column */}
        <div>
          <span className="font-display italic text-[28px] font-light text-white block">
            Something Sweet
          </span>
          <span className="font-heading text-[9px] tracking-[0.45em] uppercase text-gold-slide block mb-5">
            by Erica G. McCants
          </span>
          <p className="text-sm leading-[1.9] text-white/60">
            Custom cakes, cookies & cupcakes handcrafted from scratch for every
            celebration. No order too big, no detail too small.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <h4 className="text-[9px] font-medium tracking-[0.4em] uppercase text-gold-mid mb-5 pb-2.5 border-b border-gold/20">
            Navigate
          </h4>
          <ul className="space-y-3">
            {[
              { label: "Home", to: "/" },
              { label: "Gallery", to: "/gallery" },
              { label: "Weekly Special", to: "/#special" },
              { label: "Place an Order", to: "/order" },
              { label: "About Erica", to: "/about" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-white/60 hover:text-gold-bright transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Order */}
        <div>
          <h4 className="text-[9px] font-medium tracking-[0.4em] uppercase text-gold-mid mb-5 pb-2.5 border-b border-gold/20">
            Order
          </h4>
          <ul className="space-y-3">
            {["Custom Cakes", "Cupcakes", "Cookies", "Seasonal Specials"].map(
              (item) => (
                <li key={item}>
                  <Link
                    to="/order"
                    className="text-sm text-white/60 hover:text-gold-bright transition-colors tracking-wide"
                  >
                    {item}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="text-[9px] font-medium tracking-[0.4em] uppercase text-gold-mid mb-5 pb-2.5 border-b border-gold/20">
            Connect
          </h4>
          <ul className="space-y-3">
            {["Instagram", "Facebook", "Contact Us"].map((item) => (
              <li key={item}>
                <Link
                  to={item === "Contact Us" ? "/contact" : "#"}
                  className="text-sm text-white/60 hover:text-gold-bright transition-colors tracking-wide"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/50 tracking-wide">
          © 2025 Something Sweet by Erica G. McCants — All Rights Reserved
        </p>
        <div className="h-0.5 w-16 animate-gold-slide" />
        <p className="text-xs text-white/50 tracking-wide">
          Made with 🤍
        </p>
      </div>
    </footer>
  );
}
