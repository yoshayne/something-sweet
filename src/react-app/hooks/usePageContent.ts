import { useState, useEffect } from "react";

interface PageContent {
  [key: string]: string;
}

export function usePageContent() {
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/page-content")
      .then((res) => res.json())
      .then((data) => {
        const contentMap: PageContent = {};
        data.forEach((item: { content_key: string; content_value: string }) => {
          contentMap[item.content_key] = item.content_value;
        });
        setContent(contentMap);
      })
      .catch((err) => console.error("Failed to fetch page content:", err))
      .finally(() => setLoading(false));
  }, []);

  // Helper to get content with a fallback default
  const get = (key: string, defaultValue: string): string => {
    return content[key] || defaultValue;
  };

  return { content, loading, get };
}
