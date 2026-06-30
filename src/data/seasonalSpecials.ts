// Seasonal specials data

export interface SeasonalItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: "featured" | "holiday" | "seasonal";
  available: boolean;
  availableUntil?: string;
}

export const currentSeason = "Summer";

export const seasonalItems: SeasonalItem[] = [
  {
    id: "summer-berry",
    name: "Summer Berry Cake",
    description: "Light vanilla sponge layered with fresh strawberries, blueberries, and raspberries, finished with whipped cream frosting",
    price: "From $75",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    category: "featured",
    available: true,
    availableUntil: "August 31",
  },
  {
    id: "lemon-lavender",
    name: "Lemon Lavender Cupcakes",
    description: "Delicate lemon cupcakes infused with culinary lavender, topped with honey buttercream",
    price: "$4 each",
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80",
    category: "seasonal",
    available: true,
    availableUntil: "September 15",
  },
  {
    id: "peach-cobbler",
    name: "Peach Cobbler Cookies",
    description: "Soft sugar cookies with brown butter peach filling and cinnamon streusel topping",
    price: "$3.50 each",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
    category: "seasonal",
    available: true,
    availableUntil: "August 31",
  },
  {
    id: "tropical-paradise",
    name: "Tropical Paradise Cake",
    description: "Coconut cake with pineapple curd, passion fruit buttercream, and toasted coconut",
    price: "From $85",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
    category: "seasonal",
    available: true,
    availableUntil: "September 30",
  },
  {
    id: "graduation",
    name: "Graduation Celebration Box",
    description: "Assorted dozen of decorated sugar cookies with caps, diplomas, and custom school colors",
    price: "$48",
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&q=80",
    category: "holiday",
    available: true,
    availableUntil: "June 30",
  },
  {
    id: "fourth-july",
    name: "Stars & Stripes Cupcakes",
    description: "Vanilla and red velvet cupcakes with patriotic sprinkles and swirled red, white & blue frosting",
    price: "$42/dozen",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80",
    category: "holiday",
    available: true,
    availableUntil: "July 4",
  },
];

export const upcomingSpecials = [
  {
    season: "Fall Preview",
    items: [
      "Pumpkin Spice Cupcakes",
      "Apple Cider Donuts",
      "Maple Pecan Cake",
      "Halloween Cookie Sets",
    ],
    availableFrom: "September 1",
  },
  {
    season: "Holiday Preview",
    items: [
      "Gingerbread House Kits",
      "Christmas Cookie Platters",
      "Eggnog Cheesecake",
      "Peppermint Bark Brownies",
    ],
    availableFrom: "November 1",
  },
];
