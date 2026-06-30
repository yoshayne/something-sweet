import { Link } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { galleryItems as staticGalleryItems } from "@/data/gallery";

interface DisplayItem {
  id: string;
  title: string;
  image: string;
  category: string;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GallerySection() {
  const [uploadedImages, setUploadedImages] = useState<DisplayItem[]>([]);

  // Fetch uploaded gallery images
  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUploadedImages(
            data.map((img: { id: number; title: string; image_url: string; category: string }) => ({
              id: `uploaded-${img.id}`,
              title: img.title,
              image: img.image_url,
              category: img.category,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Combine and randomly select 5 images
  const displayItems = useMemo(() => {
    const allImages: DisplayItem[] = [
      ...staticGalleryItems.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        category: item.category,
      })),
      ...uploadedImages,
    ];
    
    // Shuffle and take first 5
    const shuffled = shuffleArray(allImages);
    return shuffled.slice(0, 5);
  }, [uploadedImages]);
  return (
    <section className="py-24 px-6 lg:px-16 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-7 h-px bg-gold-gradient" />
            <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-gold-deep">
              The Work
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-black leading-[1.05]">
            Recent <em className="italic font-light text-gold-gradient">Creations</em>
          </h2>
        </div>
        <Link
          to="/gallery"
          className="text-xs font-normal tracking-[0.15em] uppercase text-charcoal border-b border-black/25 pb-0.5 hover:text-gold-deep hover:border-gold transition-colors"
        >
          View Full Gallery
        </Link>
      </div>

      {/* Mosaic Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-12 lg:grid-rows-2 gap-1 h-auto lg:h-[400px]">
        {displayItems.map((item, index) => {
          const isLarge = index === 0;
          const isDark = index === 0 || index === 3;
          
          // Grid positioning for desktop
          const gridClass = index === 0 
            ? "lg:col-span-5 lg:row-span-2 h-48 lg:h-auto" 
            : index === 1 
              ? "lg:col-span-3 lg:row-span-1 h-48 lg:h-auto"
              : index === 2
                ? "lg:col-span-4 lg:row-span-1 h-48 lg:h-auto"
                : index === 3
                  ? "lg:col-span-3 lg:row-span-1 h-48 lg:h-auto"
                  : "lg:col-span-4 lg:row-span-1 h-48 lg:h-auto";

          return (
            <Link
              key={item.id}
              to="/gallery"
              className={`group overflow-hidden relative cursor-pointer ${gridClass}`}
            >
              <div
                className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                  isDark
                    ? "bg-gradient-to-br from-[#1a1a1a] to-charcoal"
                    : "bg-gradient-to-br from-light-gray to-[#eae6de]"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title Overlay - Always Visible */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-start justify-end p-5">
                <span className={`font-display italic text-white leading-none mb-1.5 ${isLarge ? 'text-2xl' : 'text-lg'}`}>
                  {item.title}
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-gold-bright opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Browse All →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
