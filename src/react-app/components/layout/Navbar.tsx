import { useState } from "react";
import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { usePageContent } from "@/react-app/hooks/usePageContent";

const navItems = [
  { label: "Gallery", to: "/gallery" },
  { label: "Order", to: "/order" },
  { label: "Specials", to: "/specials" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const { get } = usePageContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const announcementText = get(
    "home_announcement",
    "Handcrafted to order ◆ Custom cakes, cookies & cupcakes ◆ Order online — pay securely on site"
  );

  return (
    <>
      {/* Announcement Bar */}
      <div className="relative bg-gradient-to-r from-black via-charcoal to-black py-2 sm:py-3 px-4 sm:px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
        <p className="text-[9px] sm:text-[11px] font-normal tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gold-mid relative z-10 line-clamp-1">
          {announcementText}
        </p>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/97 backdrop-blur-md border-b border-black/8 px-4 sm:px-6 lg:px-16 h-[64px] sm:h-[76px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-start">
          <span className="font-display italic text-[20px] sm:text-[26px] font-light text-black leading-none tracking-wide">
            Something Sweet
          </span>
          <span className="font-heading text-[7px] sm:text-[9px] font-medium tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gold-slide mt-0.5">
            by Erica · Handcrafted
          </span>
        </Link>

        {/* Nav Links - Hidden on mobile */}
        <ul className="hidden lg:flex gap-9 list-none">
          {navItems.slice(0, 4).map((item) => (
            <li key={item.label}>
              <Link
                to={item.to}
                className="text-xs font-normal tracking-[0.12em] uppercase text-charcoal hover:text-black transition-colors relative group pb-0.5"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-px animate-gold-slide group-hover:w-full transition-all duration-300" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Order Button - Hidden on very small screens */}
          <Link
            to="/order"
            className="hidden sm:block btn-gold font-heading text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase text-white px-5 sm:px-7 py-3 sm:py-3.5 hover:-translate-y-0.5 transition-transform"
          >
            Order Now
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 z-50 h-full w-[280px] bg-white shadow-xl transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-light-gray">
          <span className="font-display italic text-lg text-black">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-black"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="p-5">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-sm font-medium tracking-[0.1em] uppercase text-charcoal hover:bg-off-white hover:text-black transition-colors rounded"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="mt-6 pt-6 border-t border-light-gray">
            <Link
              to="/order"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-gold block text-center font-heading text-[11px] font-medium tracking-[0.2em] uppercase text-white px-6 py-4"
            >
              Place Your Order
            </Link>
          </div>

          {/* Brand */}
          <div className="mt-8 pt-6 border-t border-light-gray text-center">
            <span className="font-display italic text-base text-black/50">Something Sweet</span>
            <span className="block text-[8px] font-medium tracking-[0.3em] uppercase text-gold-deep mt-1">
              by Erica · Handcrafted
            </span>
          </div>
        </nav>
      </div>
    </>
  );
}
