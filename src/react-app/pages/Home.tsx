import Navbar from "@/react-app/components/layout/Navbar";
import Footer from "@/react-app/components/layout/Footer";
import HeroSection from "@/react-app/components/home/HeroSection";
import SpecialSection from "@/react-app/components/home/SpecialSection";
import GallerySection from "@/react-app/components/home/GallerySection";
import ProcessSection from "@/react-app/components/home/ProcessSection";
import EmailSection from "@/react-app/components/home/EmailSection";
import CTASection from "@/react-app/components/home/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      
      {/* Animated Gold Divider */}
      <div className="h-[3px] animate-gold-slide" />
      
      <SpecialSection />
      
      {/* Animated Gold Divider */}
      <div className="h-[3px] animate-gold-slide" />
      
      <GallerySection />
      <ProcessSection />
      <EmailSection />
      <CTASection />
      <Footer />
    </div>
  );
}
