import { type GalleryItem } from "@/data/gallery";

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
}

const categoryLabels: Record<string, string> = {
  cakes: "Cake",
  cupcakes: "Cupcake",
  cookies: "Cookies",
  seasonal: "Seasonal",
};

export default function GalleryCard({ item, index }: GalleryCardProps) {
  return (
    <article
      className="break-inside-avoid group relative overflow-hidden bg-white animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Featured Badge */}
        {item.featured && (
          <div className="absolute top-3 left-3 bg-gold-gradient px-3 py-1.5">
            <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-white">
              Featured
            </span>
          </div>
        )}

        {/* Category Tag */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5">
          <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-gold-mid">
            {categoryLabels[item.category]}
          </span>
        </div>

        {/* Hover Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="font-display text-xl font-semibold text-white mb-1.5">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-xs text-white/70 leading-relaxed">
              {item.description}
            </p>
          )}
          <a
            href="/order"
            className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-gold-bright mt-4 hover:text-white transition-colors"
          >
            Order Similar
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom Info (visible by default on mobile) */}
      <div className="p-4 lg:hidden border-t border-light-gray">
        <h3 className="font-display text-lg font-semibold text-black mb-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-gray">{item.description}</p>
        )}
      </div>
    </article>
  );
}
