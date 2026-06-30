import { useState } from "react";
import { Link, useLocation } from "react-router";
import { LayoutDashboard, ClipboardList, FileText, Image, Images, Settings, Home, ChevronLeft, Type, Menu, X, CalendarDays, Mail, Send } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Schedule", href: "/admin/schedule", icon: CalendarDays },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { label: "Send Campaign", href: "/admin/email-campaign", icon: Send },
  { label: "Page Content", href: "/admin/content", icon: Type },
  { label: "Site Images", href: "/admin/site-images", icon: Image },
  { label: "Gallery Photos", href: "/admin/gallery", icon: Images },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-white/10">
        <h1 className="font-display text-xl">Something Sweet</h1>
        <p className="text-xs text-gold-400 tracking-[0.2em] mt-1">ADMIN DASHBOARD</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? "bg-[length:200%_100%] animate-gold-slide text-black font-medium shadow-lg" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  style={isActive ? {
                    backgroundImage: 'linear-gradient(90deg, #9A6F0A, #C4941A, #F5C842, #C4941A, #9A6F0A)'
                  } : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <Home className="w-4 h-4" />
          Back to Site
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0C0C0C] text-white flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="font-display text-lg">Something Sweet</h1>
          <p className="text-[10px] text-gold-400 tracking-[0.15em]">ADMIN</p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <aside className={`
        lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-[#0C0C0C] text-white z-50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-[#0C0C0C] text-white flex-col">
        <NavContent />
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
