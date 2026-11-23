// High resolution, curated luxury fashion photography catalog for Men, Women, Kids & Unisex
export const INITIAL_CATEGORIES = [
  {
    name: "Outerwear & Coats",
    slug: "outerwear-coats",
    description: "Architectural trench coats, tailored overcoats, and structured jackets for all ages.",
    image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Hoodies & Sweats",
    slug: "hoodies-sweats",
    description: "Heavyweight 520 GSM French terry oversized hoodies and relaxed loungewear.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Shirts & Tops",
    slug: "shirts-tops",
    description: "Crisp poplin button-downs, fluid silk blend resort shirts, and minimalist tees.",
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
    description: "Chunky merino wool cardigans, cashmere roll necks, and tactile rib-knit jumpers.",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Accessories & Bags",
    slug: "accessories-bags",
    description: "Supple Italian leather bags, minimal caps, wool scarves, and leather belts.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
  },
];

export const INITIAL_PRODUCTS = [
  // ==========================================
  // WOMEN'S COLLECTION
  // ==========================================
  {
    id: "prod-w1",
    name: "Cashmere Double-Breasted Overcoat",
    slug: "women-cashmere-double-breasted-overcoat",
    description: "A masterclass in tailored luxury. Crafted from an ultra-soft cashmere and virgin wool blend with structured padded shoulders, horn button closures, and a full viscose satin lining.",
    details: [
      "80% Virgin Wool, 20% Cashmere",
      "Wide peak lapel with buttonhole",
      "Welt chest pocket & interior ticket pockets",
      "Dry clean only by garment specialist",
      "Tailored relaxed silhouette"
    ],
    price: 9499,
    compareAtPrice: 13999,
    categorySlug: "outerwear-coats",
    category: { name: "Outerwear & Coats", slug: "outerwear-coats" },
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
    isTrending: true,
    isBestseller: true,
    tags: ["luxury", "coat", "winter", "formal", "outerwear", "women"],
    rating: 4.9,
    reviewsCount: 38,
  },
  {
    id: "prod-w2",
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
    category: { name: "Knitwear & Sweaters", slug: "knitwear-sweaters" },
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
    isNewArrival: false,
    isTrending: true,
    isBestseller: true,
    tags: ["knitwear", "cardigan", "wool", "winter", "cozy", "women"],
    rating: 4.9,
    reviewsCount: 41,
  },
  {
    id: "prod-w3",
    name: "Water-Repellent Technical Trench Coat",
    slug: "women-technical-trench-coat",
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
    category: { name: "Outerwear & Coats", slug: "outerwear-coats" },
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
    isFeatured: false,
    isNewArrival: true,
    isTrending: false,
    tags: ["trench", "coat", "outerwear", "waterproof", "women"],
    rating: 4.8,
    reviewsCount: 33,
  },
  {
    id: "prod-w4",
    name: "Fluid Silk Blend Pleated Midi Dress",
    slug: "fluid-silk-blend-pleated-midi-dress",
    description: "An effortlessly graceful silhouette cut from pure silk-tencel blend. Features refined accordian pleating, drop waist architectural seams, and delicate button cuffs.",
    details: [
      "65% Tencel, 35% Mulberry Silk",
      "Micro-pleated skirt panels",
      "Concealed side zipper closure",
      "Removable silk waist tie",
      "Gentle dry clean"
    ],
    price: 6499,
    compareAtPrice: 8999,
    categorySlug: "shirts-tops",
    category: { name: "Shirts & Tops", slug: "shirts-tops" },
    gender: "Women",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Earthy Taupe", hexCode: "#968370", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop" },
      { name: "Onyx Black", hexCode: "#111111", image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 25,
    isFeatured: true,
    isNewArrival: true,
    isTrending: true,
    tags: ["dress", "silk", "pleated", "evening", "women"],
    rating: 4.9,
    reviewsCount: 27,
  },

  // ==========================================
  // MEN'S COLLECTION
  // ==========================================
  {
    id: "prod-m1",
    name: "Tailored Peak-Lapel Wool Overcoat",
    slug: "men-tailored-peak-lapel-wool-overcoat",
    description: "Engineered with precision shoulders, wide peak lapels, and heavy virgin wool coating. Designed for sharp formal layering over fine knits and crisp poplin shirts.",
    details: [
      "100% Virgin Melton Wool",
      "Full cupro lining for fluid drape",
      "Deep interior ticket pockets",
      "Horn button front closure",
      "Specialist dry clean only"
    ],
    price: 9999,
    compareAtPrice: 14500,
    categorySlug: "outerwear-coats",
    category: { name: "Outerwear & Coats", slug: "outerwear-coats" },
    gender: "Men",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Charcoal", hexCode: "#3C3F42", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop" },
      { name: "Camel", hexCode: "#C19A6B", image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 30,
    isFeatured: true,
    isNewArrival: true,
    isTrending: true,
    isBestseller: true,
    tags: ["tailored", "overcoat", "wool", "formal", "men"],
    rating: 4.9,
    reviewsCount: 45,
  },
  {
    id: "prod-m2",
    name: "Relaxed Cuban Camp-Collar Silk Shirt",
    slug: "men-cuban-camp-collar-silk-shirt",
    description: "A breezy, fluid resort button-down cut from silk-blend fabric. Features a relaxed retro camp collar, mother-of-pearl buttons, and a clean straight hem.",
    details: [
      "70% Tencel Lyocell, 30% Mulberry Silk",
      "Camp Cuban collar",
      "Real mother-of-pearl buttons",
      "Side hem vents for easy movement",
      "Cool iron, machine wash gentle"
    ],
    price: 3199,
    compareAtPrice: 4299,
    categorySlug: "shirts-tops",
    category: { name: "Shirts & Tops", slug: "shirts-tops" },
    gender: "Men",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Sage", hexCode: "#7A8B7B", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop" },
      { name: "Cream", hexCode: "#F5F0EB", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 45,
    isFeatured: false,
    isNewArrival: true,
    isTrending: true,
    tags: ["shirt", "resort", "cuban", "silk", "men"],
    rating: 4.8,
    reviewsCount: 31,
  },
  {
    id: "prod-m3",
    name: "Double-Pleated Wide Relaxed Chinos",
    slug: "men-double-pleated-wide-chinos",
    description: "Constructed with dual front pleats, an expansive relaxed leg, and heavy combed cotton twill. Delivers natural drape with high longevity.",
    details: [
      "100% Combed Cotton Heavy Twill (340 GSM)",
      "Double reverse front pleats",
      "Concealed hook and bar closure",
      "Side slant pockets & rear jetted pockets",
      "Pre-washed to prevent shrinkage"
    ],
    price: 3899,
    compareAtPrice: 5299,
    categorySlug: "tailored-trousers",
    category: { name: "Tailored Trousers", slug: "tailored-trousers" },
    gender: "Men",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Navy", hexCode: "#1B2430", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop" },
      { name: "Taupe", hexCode: "#968370", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 38,
    isFeatured: false,
    isNewArrival: false,
    isTrending: true,
    tags: ["chinos", "trousers", "pleated", "cotton", "men"],
    rating: 4.8,
    reviewsCount: 24,
  },

  // ==========================================
  // KIDS COLLECTION
  // ==========================================
  {
    id: "prod-k1",
    name: "Junior Organic Cotton Mini Trench",
    slug: "kids-junior-organic-cotton-trench",
    description: "A tailored miniature trench coat crafted with child-safe organic cotton gabardine. Features horn-effect resin buttons, a detachable hood, and soft breathable lining.",
    details: [
      "100% GOTS-Certified Organic Cotton",
      "Detachable storm hood with snaps",
      "Soft skin-friendly cotton lining",
      "Resin durable buttons",
      "Machine wash 30°C delicate"
    ],
    price: 3499,
    compareAtPrice: 4799,
    categorySlug: "outerwear-coats",
    category: { name: "Outerwear & Coats", slug: "outerwear-coats" },
    gender: "Kids",
    sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y"],
    colors: [
      { name: "Stone Khaki", hexCode: "#B5A895", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1000&auto=format&fit=crop" },
      { name: "Navy", hexCode: "#1B2430", image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 40,
    isFeatured: true,
    isNewArrival: true,
    isTrending: true,
    isBestseller: true,
    tags: ["kids", "trench", "organic", "outerwear", "children"],
    rating: 5.0,
    reviewsCount: 19,
  },
  {
    id: "prod-k2",
    name: "Junior Heavyweight Loopback Boxy Hoodie",
    slug: "kids-junior-heavyweight-boxy-hoodie",
    description: "Designed after our signature adult hoodie, scaled down for young creatives. Soft non-toxic loopback cotton, drop shoulders, and durable reinforced stitching.",
    details: [
      "100% Organic Combed French Terry",
      "Seamless soft kangaroo pocket",
      "Tag-free collar for zero scratchiness",
      "Dense ribbed cuffs and hem",
      "Pre-shrunk durable wash"
    ],
    price: 1999,
    compareAtPrice: 2699,
    categorySlug: "hoodies-sweats",
    category: { name: "Hoodies & Sweats", slug: "hoodies-sweats" },
    gender: "Kids",
    sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y"],
    colors: [
      { name: "Bone White", hexCode: "#E8E5DD", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1000&auto=format&fit=crop" },
      { name: "Sage", hexCode: "#7A8B7B", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 60,
    isFeatured: false,
    isNewArrival: true,
    isTrending: true,
    tags: ["kids", "hoodie", "sweatshirt", "organic", "cotton"],
    rating: 4.9,
    reviewsCount: 22,
  },
  {
    id: "prod-k3",
    name: "Junior Cable-Knit Lambswool Jumper",
    slug: "kids-junior-cable-knit-jumper",
    description: "Spun from ultra-fine Merino lambswool for supreme itch-free warmth. Classic heritage cable knit pattern with flexible ribbed hems.",
    details: [
      "100% Ultra-Fine Merino Wool",
      "Hypoallergenic and ultra-gentle",
      "Natural thermal regulating properties",
      "Ribbed collar and cuffs",
      "Hand wash cold, dry flat"
    ],
    price: 2699,
    compareAtPrice: 3500,
    categorySlug: "knitwear-sweaters",
    category: { name: "Knitwear & Sweaters", slug: "knitwear-sweaters" },
    gender: "Kids",
    sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y"],
    colors: [
      { name: "Cream", hexCode: "#F5F0EB", image: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=1000&auto=format&fit=crop" },
      { name: "Camel", hexCode: "#C19A6B", image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 32,
    isFeatured: true,
    isNewArrival: false,
    isTrending: false,
    tags: ["kids", "knitwear", "sweater", "merino", "wool"],
    rating: 4.8,
    reviewsCount: 16,
  },

  // ==========================================
  // UNISEX COLLECTION
  // ==========================================
  {
    id: "prod-u1",
    name: "Architectural Heavyweight 520 GSM Hoodie",
    slug: "unisex-heavyweight-boxy-hoodie",
    description: "Our world-renowned unisex archetype. Crafted from bespoke 520 GSM loopback cotton fleece. Featuring a double-layered crossover hood without drawstrings for an uncompromising clean drape, drop shoulders, and dense ribbed cuffs.",
    details: [
      "100% Organic Heavyweight Cotton (520 GSM)",
      "Double-layered crossover hood",
      "Kangaroo concealed side seam pockets",
      "Pre-shrunk to maintain fit over lifetime",
      "Oversized boxy unisex silhouette"
    ],
    price: 3499,
    compareAtPrice: 4499,
    categorySlug: "hoodies-sweats",
    category: { name: "Hoodies & Sweats", slug: "hoodies-sweats" },
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
    isTrending: true,
    isBestseller: true,
    tags: ["unisex", "streetwear", "hoodie", "minimal", "oversized", "cotton"],
    rating: 4.9,
    reviewsCount: 88,
  },
  {
    id: "prod-u2",
    name: "Wide-Leg Pleated Wool Trousers",
    slug: "unisex-wide-leg-pleated-wool-trousers",
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
    category: { name: "Tailored Trousers", slug: "tailored-trousers" },
    gender: "Unisex",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal", hexCode: "#3C3F42", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop" },
      { name: "Navy", hexCode: "#1B2430", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 40,
    isFeatured: true,
    isNewArrival: false,
    isTrending: true,
    tags: ["unisex", "trousers", "pleated", "wool", "tailored"],
    rating: 4.9,
    reviewsCount: 54,
  },
  {
    id: "prod-u3",
    name: "Structured Mock-Neck Minimalist Tee",
    slug: "unisex-structured-mock-neck-tee",
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
    category: { name: "Shirts & Tops", slug: "shirts-tops" },
    gender: "Unisex",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hexCode: "#FFFFFF", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop" },
      { name: "Charcoal", hexCode: "#535962", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop" },
      { name: "Black", hexCode: "#151515", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop" }
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
    isTrending: false,
    tags: ["unisex", "t-shirt", "mock-neck", "basics", "essential"],
    rating: 4.8,
    reviewsCount: 65,
  },
  {
    id: "prod-u4",
    name: "Minimalist Full-Grain Leather Weekender Bag",
    slug: "unisex-full-grain-leather-weekender-bag",
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
    category: { name: "Accessories & Bags", slug: "accessories-bags" },
    gender: "Unisex",
    sizes: ["One Size"],
    colors: [
      { name: "Taupe", hexCode: "#3D2B1F", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop" },
      { name: "Black", hexCode: "#111111", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop" }
    ],
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop"
    ],
    inStock: true,
    stockCount: 18,
    isFeatured: true,
    isNewArrival: false,
    isTrending: true,
    tags: ["unisex", "leather", "bag", "travel", "accessories", "luxury"],
    rating: 5.0,
    reviewsCount: 29,
  }
];
