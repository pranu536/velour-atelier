// High resolution, curated Unsplash fashion photography catalogue
export const INITIAL_CATEGORIES = [
  {
    name: "Outerwear & Coats",
    slug: "outerwear-coats",
    description: "Architectural trench coats, tailored overcoats, and structured jackets.",
    image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Hoodies & Sweats",
    slug: "hoodies-sweats",
    description: "Heavyweight French terry oversized hoodies and relaxed loungewear.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Shirts & Tops",
    slug: "shirts-tops",
    description: "Crisp poplin button-downs, silk blend resort shirts, and minimalist tees.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Tailored Trousers",
    slug: "tailored-trousers",
    description: "Wide-leg pleated trousers, relaxed chinos, and refined bottoms.",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Knitwear & Sweaters",
    slug: "knitwear-sweaters",
    description: "Chunky merino wool cardigans, cashmere roll necks, and rib-knit jumpers.",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Accessories & Bags",
    slug: "accessories-bags",
    description: "Supple leather totes, minimal caps, wool scarves, and leather belts.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Cashmere Double-Breasted Overcoat",
    slug: "cashmere-double-breasted-overcoat",
    description: "A masterclass in tailored luxury. Crafted from an ultra-soft cashmere and virgin wool blend with structured padded shoulders, horn button closures, and a full viscose satin lining.",
    details: [
      "80% Virgin Wool, 20% Cashmere",
      "Wide peak lapel with buttonhole",
      "Welt chest pocket & interior ticket pockets",
      "Dry clean only by garment specialist",
      "Tailored relaxed fit, true to size"
    ],
    price: 9499,
    compareAtPrice: 13999,
    categorySlug: "outerwear-coats",
    category: {
      name: "Outerwear & Coats",
      slug: "outerwear-coats",
    },
    gender: "Women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Camel", hexCode: "#C19A6B", image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop" },
      { name: "Onyx Black", hexCode: "#111111", image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 35,
    isFeatured: true,
    isNewArrival: true,
    tags: ["luxury", "coat", "winter", "formal", "outerwear", "women"],
    rating: 4.9,
    reviewsCount: 38,
  },
  {
    id: "prod-2",
    name: "Architectural Heavyweight Boxy Hoodie",
    slug: "architectural-heavyweight-boxy-hoodie",
    description: "Engineered from bespoke 520 GSM loopback cotton fleece. Featuring a double-layered hood without drawstrings for an uncompromising clean drape, drop shoulders, and dense ribbed cuffs.",
    details: [
      "100% Organic Heavyweight Cotton (520 GSM)",
      "Double-layered crossover hood",
      "Kangaroo concealed side seam pockets",
      "Pre-shrunk to maintain fit over lifetime",
      "Oversized boxy silhouette"
    ],
    price: 3499,
    compareAtPrice: 4499,
    categorySlug: "hoodies-sweats",
    category: {
      name: "Hoodies & Sweats",
      slug: "hoodies-sweats",
    },
    gender: "Unisex",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Bone White", hexCode: "#E8E5DD", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop" },
      { name: "Faded Sage", hexCode: "#7A8B7B", image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop" },
      { name: "Charcoal", hexCode: "#2A2A2A", image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 80,
    isFeatured: true,
    isNewArrival: true,
    tags: ["streetwear", "hoodie", "minimal", "oversized", "cotton"],
    rating: 4.8,
    reviewsCount: 72,
  },
  {
    id: "prod-3",
    name: "Relaxed Drape Silk-Blend Resort Shirt",
    slug: "relaxed-drape-silk-blend-resort-shirt",
    description: "Designed with an open Cuban camp collar and fluid silk-tencel drape. Perfect for elevated leisure and refined layering over minimalist ribbed tank tops.",
    details: [
      "70% Lyocell, 30% Mulberry Silk",
      "Camp collar with loop button fastening",
      "Mother-of-pearl buttons",
      "Straight hem with side slits",
      "Breathable, natural cooling weave"
    ],
    price: 2899,
    compareAtPrice: 3899,
    categorySlug: "shirts-tops",
    category: {
      name: "Shirts & Tops",
      slug: "shirts-tops",
    },
    gender: "Women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Earthy Taupe", hexCode: "#968370", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop" },
      { name: "Alabaster", hexCode: "#F0EFEA", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 45,
    isFeatured: false,
    isNewArrival: true,
    tags: ["shirt", "resort", "silk", "summer", "relaxed", "women"],
    rating: 4.7,
    reviewsCount: 29,
  },
  {
    id: "prod-4",
    name: "Wide-Leg Pleated Wool Trousers",
    slug: "wide-leg-pleated-wool-trousers",
    description: "Tailored with a high-rise waist, deep double reverse pleats, and an expansive wide-leg cascade. Cut from high-twist tropical wool for year-round effortless movement.",
    details: [
      "100% High-Twist Tropical Wool",
      "Double front pleats with sharp center crease",
      "Side adjuster buckles on waistband",
      "Unfinished hem for custom tailoring",
      "Slanted side pockets and rear welt pockets"
    ],
    price: 4299,
    compareAtPrice: 5999,
    categorySlug: "tailored-trousers",
    category: {
      name: "Tailored Trousers",
      slug: "tailored-trousers",
    },
    gender: "Women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal Heather", hexCode: "#3C3F42", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop" },
      { name: "Deep Navy", hexCode: "#1B2430", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 40,
    isFeatured: true,
    isNewArrival: false,
    tags: ["pants", "tailored", "trousers", "pleated", "wool", "women"],
    rating: 4.9,
    reviewsCount: 54,
  },
  {
    id: "prod-5",
    name: "Sculptural Chunky Wool Cardigan",
    slug: "sculptural-chunky-wool-cardigan",
    description: "An expressive knit statement piece spun from 7-gauge British lambswool. Features oversized horn buttons, a deep V-neckline, and ribbed tactile edging.",
    details: [
      "100% Pure British Lambswool",
      "Heavy 7-gauge half-cardigan stitch",
      "Custom engraved faux-horn buttons",
      "Raglan shoulder construction",
      "Hand wash cold, dry flat"
    ],
    price: 4899,
    compareAtPrice: 6500,
    categorySlug: "knitwear-sweaters",
    category: {
      name: "Knitwear & Sweaters",
      slug: "knitwear-sweaters",
    },
    gender: "Women",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Oatmeal Melange", hexCode: "#D9CBB8", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop" },
      { name: "Forest Moss", hexCode: "#3B4D3C", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 28,
    isFeatured: true,
    isNewArrival: true,
    tags: ["knitwear", "cardigan", "wool", "winter", "cozy", "women"],
    rating: 4.9,
    reviewsCount: 41,
  },
  {
    id: "prod-6",
    name: "Minimalist Full-Grain Leather Weekender Bag",
    slug: "minimalist-full-grain-leather-weekender-bag",
    description: "Handcrafted from supple Italian vegetable-tanned leather. Features brass hardware with brushed gunmetal finish, removable padded shoulder strap, and internal laptop compartment.",
    details: [
      "100% Vegetable-Tanned Italian Leather",
      "Cotton twill reinforced interior lining",
      "YKK Excella two-way zipper system",
      "Padded 16-inch laptop pocket",
      "Dimensions: 50cm x 28cm x 24cm"
    ],
    price: 8999,
    compareAtPrice: 11999,
    categorySlug: "accessories-bags",
    category: {
      name: "Accessories & Bags",
      slug: "accessories-bags",
    },
    gender: "Unisex",
    sizes: ["One Size"],
    colors: [
      { name: "Espresso Brown", hexCode: "#3D2B1F", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop" },
      { name: "Midnight Black", hexCode: "#111111", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 18,
    isFeatured: false,
    isNewArrival: true,
    tags: ["leather", "bag", "travel", "accessories", "luxury"],
    rating: 5.0,
    reviewsCount: 19,
  },
  {
    id: "prod-7",
    name: "Water-Repellent Technical Trench Coat",
    slug: "water-repellent-technical-trench-coat",
    description: "A futuristic reinterpretation of the heritage trench. Engineered with high-density bonded gabardine, storm flap, magnetic collar closure, and an adjustable waist belt.",
    details: [
      "High-density water-resistant cotton-nylon blend",
      "Raglan sleeves for natural mobility",
      "Magnetic collar throat latch",
      "Tonal horn buckle belt",
      "Breathable storm flap at back yoke"
    ],
    price: 7999,
    compareAtPrice: 10499,
    categorySlug: "outerwear-coats",
    category: {
      name: "Outerwear & Coats",
      slug: "outerwear-coats",
    },
    gender: "Women",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Stone Khaki", hexCode: "#B5A895", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" },
      { name: "Pitch Black", hexCode: "#0C0C0C", image: "https://images.unsplash.com/photo-1525450824786-227cbef70703?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525450824786-227cbef70703?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 22,
    isFeatured: true,
    isNewArrival: false,
    tags: ["trench", "coat", "outerwear", "waterproof", "minimalist", "women"],
    rating: 4.8,
    reviewsCount: 33,
  },
  {
    id: "prod-8",
    name: "Structured Mock-Neck Minimalist Tee",
    slug: "structured-mock-neck-minimalist-tee",
    description: "Cut from ultra-dense 300 GSM combed cotton jersey with a snug mock-neck rib and drop shoulder structure. Maintains a pristine clean silhouette through countless wears.",
    details: [
      "100% Long-Staple Combed Cotton (300 GSM)",
      "3.5cm structured mock neck collar",
      "Blind-stitched hems",
      "Enzyme-washed for cloud-like touch",
      "Relaxed architectural fit"
    ],
    price: 1899,
    compareAtPrice: 2499,
    categorySlug: "shirts-tops",
    category: {
      name: "Shirts & Tops",
      slug: "shirts-tops",
    },
    gender: "Women",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Optic White", hexCode: "#FFFFFF", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop" },
      { name: "Washed Slate", hexCode: "#535962", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop" },
      { name: "Pitch Black", hexCode: "#151515", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 120,
    isFeatured: false,
    isNewArrival: true,
    tags: ["t-shirt", "mock-neck", "basics", "essential", "cotton", "women"],
    rating: 4.8,
    reviewsCount: 65,
  }
];
