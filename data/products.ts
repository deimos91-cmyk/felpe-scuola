export type ProductVariant = "kids" | "adult" | "standard";

export type Product = {
  name: string;
  modelKey: string;
  price: number;
  description: string;
  colors: string[];
  sizes?: string[];
  variant?: ProductVariant;
};

export const products: Product[] = [
  {
    name: "Felpa KANGAROO (Adulto)",
    modelKey: "KANGAROO",
    variant: "adult",
    price: 25,
    description: "Felpa con cappuccio, tasca a marsupio e interno felpato.",
    colors: [
      "Bianco",
      "Blu-Navy",
      "Bordeaux",
      "Celeste",
      "Cream",
      "Grigio-Oxford",
      "Havana",
      "Lilla",
      "Nero",
      "Rosa-Petalo",
      "Verde-Bosco",
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Felpa KANGAROO (Bambino)",
    modelKey: "KANGAROO",
    variant: "kids",
    price: 22,
    description: "Versione bambino della felpa KANGAROO, tagliata su misura.",
    colors: ["Bianco", "Blu", "Grigio", "Nero"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    name: "Maglietta WHALE (Adulto)",
    modelKey: "WHALE",
    variant: "adult",
    price: 15,
    description: "T-shirt leggera, cotone 100%, taglio unisex.",
    colors: [
      "Bianco",
      "Blu-Navy",
      "Bordeaux",
      "Celeste",
      "Cream",
      "Grigio-Oxford",
      "Havana",
      "Nero",
      "Rosa-Petalo",
      "Verde-Bosco",
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Maglietta WHALE (Bambino)",
    modelKey: "WHALE",
    variant: "kids",
    price: 13,
    description: "T-shirt per bambini, morbida e resistente ai lavaggi.",
    colors: [
      "Bianco",
      "Blu-Navy",
      "Bordeaux",
      "Celeste",
      "Cream",
      "Grigio-Oxford",
      "Havana",
      "Nero",
      "Rosa-Petalo",
      "Verde-Bosco",
    ],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    name: "Borraccia VOLCANO",
    modelKey: "VOLCANO",
    variant: "standard",
    price: 12,
    description: "Borraccia termica con tappo a vite e logo inciso.",
    colors: ["Standard"],
  },
];
