import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-earrings",
    name: "Earrings",
    slug: "earrings",
    tagline: "From subtle studs to statement drops",
    image:
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { name: "Stud Earrings", slug: "studs" },
      { name: "Hoop Earrings", slug: "hoops" },
      { name: "Drop Earrings", slug: "drops" },
      { name: "Statement Earrings", slug: "statement" },
    ],
  },
  {
    id: "cat-necklaces",
    name: "Necklaces",
    slug: "necklaces",
    tagline: "Pendants, chokers & layered chains",
    image:
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { name: "Pendant", slug: "pendant" },
      { name: "Choker", slug: "choker" },
      { name: "Layered", slug: "layered" },
    ],
  },
  {
    id: "cat-rings",
    name: "Rings",
    slug: "rings",
    tagline: "Delicate bands to cocktail rings",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { name: "Stackable", slug: "stackable" },
      { name: "Cocktail", slug: "cocktail" },
      { name: "Statement", slug: "statement" },
    ],
  },
  {
    id: "cat-bracelets",
    name: "Bracelets",
    slug: "bracelets",
    tagline: "Charm, chain & cuff bracelets",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { name: "Chain", slug: "chain" },
      { name: "Charm", slug: "charm" },
      { name: "Cuff", slug: "cuff" },
    ],
  },
  {
    id: "cat-bangles",
    name: "Bangles",
    slug: "bangles",
    tagline: "Stackable kadas & bangle sets",
    image:
      "https://images.unsplash.com/photo-1508009745836-4a14be7d4f3f?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { name: "Kada", slug: "kada" },
      { name: "Bangle Set", slug: "set" },
    ],
  },
  {
    id: "cat-anklets",
    name: "Anklets",
    slug: "anklets",
    tagline: "Delicate payals for every occasion",
    image:
      "https://images.unsplash.com/photo-1620646044159-47b9d0cb1c4f?auto=format&fit=crop&w=800&q=80",
    subcategories: [{ name: "Chain", slug: "chain" }],
  },
  {
    id: "cat-sets",
    name: "Jewellery Sets",
    slug: "sets",
    tagline: "Coordinated earrings + necklace sets",
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80",
    subcategories: [{ name: "Festive", slug: "festive" }],
  },
  {
    id: "cat-hair",
    name: "Hair Accessories",
    slug: "hair",
    tagline: "Bridal pins, tiaras & juda pins",
    image:
      "https://images.unsplash.com/photo-1583257590203-9b72a4d4f5d5?auto=format&fit=crop&w=800&q=80",
    subcategories: [{ name: "Hair Pin", slug: "pin" }],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
