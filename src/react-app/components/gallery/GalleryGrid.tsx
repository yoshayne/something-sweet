import { useState, useEffect } from "react";
import { galleryItems, type GalleryCategory, type GalleryItem } from "@/data/gallery";
import GalleryCard from "./GalleryCard";

interface GalleryGridProps {
  activeCategory: GalleryCategory;
}

interface ApiGalleryImage {
  id: number;
  title: string;
  category: string;
  description: string;
  r2_key: string;
  image_url: string;
  is_featured: number;
}

export default function GalleryGrid({ activeCategory }: GalleryGridProps) {
  const [apiImages, setApiImages] = useState<GalleryItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch uploaded images
      const imagesRes = await fetch("/api/gallery");
      const data: ApiGalleryImage[] = await imagesRes.json();
      
      // Transform API data to GalleryItem format
      const transformed: GalleryItem[] = data.map((img) => ({
        id: `api-${img.id}`,
        title: img.title,
        category: img.category as Exclude<GalleryCategory, "all">,
        image: img.image_url,
        description: img.description,
        featured: img.is_featured === 1,
      }));
      
      setApiImages(transformed);
      
      // Fetch hidden placeholder IDs
      const hiddenRes = await fetch("/api/gallery/hidden");
      const hidden: string[] = await hiddenRes.json();
      setHiddenIds(hidden);
    } catch (e) {
      console.error("Failed to fetch gallery images:", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter out hidden static images, then combine with API images (API images first)
  const visibleStaticItems = galleryItems.filter((item) => !hiddenIds.includes(item.id));
  const allItems = [...apiImages, ...visibleStaticItems];
  
  const filteredItems = activeCategory === "all" 
    ? allItems 
    : allItems.filter((item) => item.category === activeCategory);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid bg-light-gray animate-pulse"
              style={{ height: `${250 + (i % 3) * 50}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray">No items found in this category.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {filteredItems.map((item, index) => (
            <GalleryCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
