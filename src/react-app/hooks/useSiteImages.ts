import { useState, useEffect } from "react";

interface RawSiteImage {
  id: number;
  location: string;
  title: string | null;
  description: string | null;
  r2_key: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface SiteImage {
  id: number;
  location: string;
  url: string;
  alt_text: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteImages {
  homepage_hero: SiteImage | null;
  homepage_special: SiteImage | null;
  about_main: SiteImage | null;
  about_secondary: SiteImage | null;
  about_kitchen: SiteImage | null;
}

// Convert r2_key to a usable URL
function buildImageUrl(r2_key: string): string {
  // r2_key is like "site/homepage_hero-123-filename.jpg"
  // We need "/api/site-images/image/homepage_hero-123-filename.jpg"
  const keyWithoutPrefix = r2_key.replace(/^site\//, "");
  return `/api/site-images/image/${keyWithoutPrefix}`;
}

export function useSiteImages() {
  const [images, setImages] = useState<SiteImages>({
    homepage_hero: null,
    homepage_special: null,
    about_main: null,
    about_secondary: null,
    about_kitchen: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/site-images")
      .then((res) => res.json())
      .then((data: RawSiteImage[]) => {
        const imageMap: SiteImages = {
          homepage_hero: null,
          homepage_special: null,
          about_main: null,
          about_secondary: null,
          about_kitchen: null,
        };
        data.forEach((img) => {
          if (img.location in imageMap) {
            imageMap[img.location as keyof SiteImages] = {
              id: img.id,
              location: img.location,
              url: buildImageUrl(img.r2_key),
              alt_text: img.title,
              title: img.title,
              created_at: img.created_at,
              updated_at: img.updated_at,
            };
          }
        });
        setImages(imageMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { images, loading };
}
