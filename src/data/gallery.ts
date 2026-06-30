export type GalleryCategory = "all" | "cakes" | "cupcakes" | "cookies" | "seasonal";

export interface GalleryItem {
  id: string;
  title: string;
  category: Exclude<GalleryCategory, "all">;
  image: string;
  description?: string;
  featured?: boolean;
}

export const galleryItems: GalleryItem[] = [
  // Cakes
  {
    id: "cake-1",
    title: "Black Gold Birthday Cake",
    category: "cakes",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=700&fit=crop",
    description: "Elegant black fondant with gold leaf accents",
    featured: true,
  },
  {
    id: "cake-2",
    title: "Classic Vanilla Wedding",
    category: "cakes",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&h=800&fit=crop",
    description: "Three-tier white buttercream with fresh flowers",
  },
  {
    id: "cake-3",
    title: "Chocolate Drip Cake",
    category: "cakes",
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=600&fit=crop",
    description: "Rich chocolate ganache with gold drip",
  },
  {
    id: "cake-4",
    title: "Rose Petal Celebration",
    category: "cakes",
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&h=700&fit=crop",
    description: "Blush pink buttercream with edible roses",
  },
  {
    id: "cake-5",
    title: "Rustic Naked Cake",
    category: "cakes",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=650&fit=crop",
    description: "Semi-naked finish with seasonal berries",
  },
  // Cupcakes
  {
    id: "cupcake-1",
    title: "Salted Caramel Swirl",
    category: "cupcakes",
    image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&h=600&fit=crop",
    description: "Vanilla base with caramel buttercream",
    featured: true,
  },
  {
    id: "cupcake-2",
    title: "Red Velvet Dreams",
    category: "cupcakes",
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&h=700&fit=crop",
    description: "Classic red velvet with cream cheese frosting",
  },
  {
    id: "cupcake-3",
    title: "Lemon Sunshine",
    category: "cupcakes",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&h=600&fit=crop",
    description: "Zesty lemon with white chocolate ganache",
  },
  {
    id: "cupcake-4",
    title: "Chocolate Truffle Tower",
    category: "cupcakes",
    image: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600&h=650&fit=crop",
    description: "Double chocolate with truffle center",
  },
  // Cookies
  {
    id: "cookie-1",
    title: "Custom Sugar Cookies",
    category: "cookies",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=600&fit=crop",
    description: "Hand-decorated royal icing designs",
    featured: true,
  },
  {
    id: "cookie-2",
    title: "Wedding Favor Set",
    category: "cookies",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=700&fit=crop",
    description: "Elegant monogram cookies in white & gold",
  },
  {
    id: "cookie-3",
    title: "Birthday Celebration Pack",
    category: "cookies",
    image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&h=600&fit=crop",
    description: "Custom themed sugar cookies",
  },
  {
    id: "cookie-4",
    title: "Holiday Collection",
    category: "cookies",
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=650&fit=crop",
    description: "Festive designs for every season",
  },
  // Seasonal
  {
    id: "seasonal-1",
    title: "Spring Floral Cake",
    category: "seasonal",
    image: "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&h=700&fit=crop",
    description: "Pastel buttercream with sugar flowers",
  },
  {
    id: "seasonal-2",
    title: "Halloween Spooky Treats",
    category: "seasonal",
    image: "https://images.unsplash.com/photo-1603903631918-a3ef22e7f6dd?w=600&h=600&fit=crop",
    description: "Themed cupcakes and cookies",
  },
  {
    id: "seasonal-3",
    title: "Winter Wonderland",
    category: "seasonal",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=650&fit=crop",
    description: "Snowflake designs with silver accents",
  },
];

export const categories: { value: GalleryCategory; label: string }[] = [
  { value: "all", label: "All Creations" },
  { value: "cakes", label: "Cakes" },
  { value: "cupcakes", label: "Cupcakes" },
  { value: "cookies", label: "Cookies" },
  { value: "seasonal", label: "Seasonal" },
];
