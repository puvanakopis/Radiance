import { Product, Category, Review, Order } from '../types';

export const mockCategories: Category[] = [
  {
    id: 'cat-skincare',
    name: 'Skincare',
    slug: 'skincare',
    description: 'Intentional formulations enriched with cold-pressed botanicals, hyaluronic acid, and active barrier lipids.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
    itemCount: 12,
    subcategories: ['Cleansers', 'Serums', 'Moisturizers', 'Eye Care', 'Face Oils', 'Masks']
  },
  {
    id: 'cat-haircare',
    name: 'Haircare',
    slug: 'haircare',
    description: 'Nutrient-rich botanical haircare crafted for weightless hydration, scalp vitality, and silk-like shine.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=1000&q=80',
    itemCount: 6,
    subcategories: ['Shampoo', 'Conditioner', 'Hair Masks', 'Scalp Treatments', 'Hair Elixirs']
  },
  {
    id: 'cat-body',
    name: 'Body Care',
    slug: 'body-care',
    description: 'Sensory body rituals powered by Ceylon tea seed oil, rich shea butter, and velvety botanical waxes.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
    itemCount: 6,
    subcategories: ['Body Lotion', 'Body Wash', 'Hand Care', 'Body Exfoliators', 'Body Oils']
  },
  {
    id: 'cat-suncare',
    name: 'Sun Care',
    slug: 'sun-care',
    description: 'Invisible, reef-safe broad spectrum defense that melts effortlessly without white cast or greasiness.',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80',
    itemCount: 4,
    subcategories: ['Face Sunscreen', 'Body Sunscreen', 'Tinted Mineral SPF', 'After-Sun Mist']
  },
  {
    id: 'cat-giftsets',
    name: 'Gift Sets',
    slug: 'gift-sets',
    description: 'Curated ritual boxes hand-packaged with reusable linen wraps and botanical essentials.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
    itemCount: 4,
    subcategories: ['Morning Ritual Kit', 'Night Repair Bundle', 'Discovery Set', 'The Complete Collection']
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-01',
    name: 'Velvet Glow Serum',
    subtitle: '10% Niacinamide + Multi-Peptide Complex',
    slug: 'velvet-glow-serum',
    category: 'Skincare',
    subcategory: 'Serums',
    price: 8900,
    originalPrice: 10500,
    size: '30ml',
    description: 'A transformative, featherlight serum engineered to illuminate tone, refine pore texture, and reinforce the skin barrier.',
    longDescription: 'Formulated with pharmaceutical-grade 10% Niacinamide, quadruple-weight Hyaluronic Acid, and bio-fermented peptide fractions. Velvet Glow Serum absorbs instantly into the dermal matrix without residue, delivering deep cell hydration and an unmistakable glass-skin sheen.',
    ingredients: [
      'Aqua (Water)', 'Niacinamide (10%)', 'Sodium Hyaluronate Multi-Molecular Complex', 
      'Camellia Sinensis (Ceylon Green Tea) Leaf Extract', 'Palmitoyl Tripeptide-5', 
      'Glycerin', 'Panthenol (Pro-Vitamin B5)', 'Allantoin', 'Centella Asiatica Extract', 'Phenoxyethanol'
    ],
    activeIngredients: [
      { name: 'Niacinamide 10%', benefit: 'Refines pores, smooths uneven texture, and regulates sebum balance.' },
      { name: 'Multi-Weight HA', benefit: 'Penetrates four distinct dermal layers for deep plumping moisture.' },
      { name: 'Bio-Peptides', benefit: 'Stimulates natural collagen synthesis and restores dermal elasticity.' }
    ],
    howToUse: 'Dispense 3-4 drops onto cleansed, slightly damp skin every morning and evening. Gently press into face, neck, and décolletage using upward gliding motions before sealing with your favorite moisturizer.',
    skinTypes: ['All Skin Types', 'Normal', 'Dry', 'Combination', 'Oily', 'Sensitive'],
    concerns: ['Brightening', 'Hydration', 'Barrier Repair', 'Anti-Aging'],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviewCount: 142,
    stock: 28,
    lowStockThreshold: 10,
    sku: 'VEL-SER-001',
    badge: 'BEST SELLER',
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    status: 'In Stock',
    createdAt: '2026-01-15'
  },
  {
    id: 'prod-02',
    name: 'Velora Hydrating Face Cream',
    subtitle: 'Ceramide NP + Squalane Barrier Emulsion',
    slug: 'velora-hydrating-face-cream',
    category: 'Skincare',
    subcategory: 'Moisturizers',
    price: 7400,
    size: '50ml',
    description: 'A deeply comforting cream that envelops dry and stressed skin in a breathable cocoon of lipid hydration.',
    longDescription: 'Formulated with 5 skin-identical ceramides, sugarcane squalane, and organic oat beta-glucan. Clinically shown to repair compromised skin barriers within 48 hours while maintaining 24-hour hydration lock.',
    ingredients: [
      'Aqua', 'Caprylic/Capric Triglyceride', 'Squalane', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 
      'Phytosphingosine', 'Cholesterol', 'Avena Sativa (Oat) Kernel Flour', 'Butyrospermum Parkii (Shea) Butter'
    ],
    activeIngredients: [
      { name: 'Ceramide Complex', benefit: 'Restores essential lipid bilayers and prevents trans-epidermal water loss.' },
      { name: 'Sugarcane Squalane', benefit: 'Mimics natural skin sebum to nourish deeply without clogging pores.' }
    ],
    howToUse: 'Warm a pea-sized amount between fingertips and smooth over face and neck in gentle circular motions. Ideal as the final step in your evening routine.',
    skinTypes: ['Dry', 'Normal', 'Sensitive', 'Combination'],
    concerns: ['Hydration', 'Barrier Repair', 'Anti-Aging'],
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviewCount: 98,
    stock: 14,
    lowStockThreshold: 10,
    sku: 'VEL-CRM-002',
    badge: 'BEST SELLER',
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    status: 'In Stock',
    createdAt: '2026-02-01'
  },
  {
    id: 'prod-03',
    name: 'Gentle Cloud Cleanser',
    subtitle: 'Amino Acid + Chamomile Micro-Foam',
    slug: 'gentle-cloud-cleanser',
    category: 'Skincare',
    subcategory: 'Cleansers',
    price: 5200,
    size: '150ml',
    description: 'An ultra-soothing, pH 5.5 cushion cleanser that melts away pollution and makeup without stripping vital oils.',
    longDescription: 'Combines coconut-derived amino surfactants with blue chamomile flower water and gotu kola extract. The plush cloud texture cushions delicate skin, leaving the barrier supple, calm, and squeak-free.',
    ingredients: ['Water', 'Sodium Cocoyl Apple Amino Acids', 'Chamomilla Recutita Flower Water', 'Glycerin', 'Centella Asiatica'],
    activeIngredients: [
      { name: 'Apple Amino Surfactants', benefit: 'Biocompatible gentle cleanse that preserves the natural acid mantle.' },
      { name: 'Blue Chamomile', benefit: 'Calms redness, irritation, and sensitivity instantaneously.' }
    ],
    howToUse: 'Pump 2 times onto wet palms, massage gently over damp face for 60 seconds, and rinse with lukewarm water.',
    skinTypes: ['All Skin Types', 'Sensitive', 'Dry', 'Oily'],
    concerns: ['Acne & Blemishes', 'Barrier Repair', 'Hydration'],
    images: [
      'https://images.unsplash.com/photo-1556228722-d0b5cd03456d?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviewCount: 84,
    stock: 45,
    lowStockThreshold: 15,
    sku: 'VEL-CLN-003',
    badge: 'CLEAN FORMULA',
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    status: 'In Stock',
    createdAt: '2026-02-14'
  },
  {
    id: 'prod-04',
    name: 'Radiance Vitamin C Serum',
    subtitle: '15% Ethyl Ascorbic Acid + Ferulic Acid',
    slug: 'radiance-vitamin-c-serum',
    category: 'Skincare',
    subcategory: 'Serums',
    price: 9800,
    originalPrice: 11500,
    size: '30ml',
    description: 'A stabilized, non-oxidizing antioxidant elixir that fades hyperpigmentation and boosts collagen radiance.',
    longDescription: 'Harnesses 15% 3-O-Ethyl Ascorbic Acid stabilized with pure Ferulic acid and Vitamin E. Formulated in a UV-shielded amber vessel to guarantee full potency down to the final drop.',
    ingredients: ['Aqua', '3-O-Ethyl Ascorbic Acid 15%', 'Ferulic Acid', 'Tocopherol (Vitamin E)', 'Kakadu Plum Extract'],
    activeIngredients: [
      { name: 'Ethyl Ascorbic Acid', benefit: 'Ultra-stable Vitamin C that brightens dark spots and evens skin tone.' },
      { name: 'Ferulic Acid 0.5%', benefit: 'Doubles antioxidant photo-protection and neutralizes environmental free radicals.' }
    ],
    howToUse: 'Apply 3-4 drops in the morning prior to moisturizer and broad-spectrum sunscreen.',
    skinTypes: ['Normal', 'Combination', 'Oily', 'Dry'],
    concerns: ['Brightening', 'Anti-Aging', 'Sun Protection'],
    images: [
      'https://images.unsplash.com/photo-1608248597359-5b4306354897?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.7,
    reviewCount: 112,
    stock: 19,
    lowStockThreshold: 10,
    sku: 'VEL-VIT-004',
    badge: 'AWARD WINNER',
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    status: 'In Stock',
    createdAt: '2026-01-20'
  },
  {
    id: 'prod-05',
    name: 'Mineral SPF 50 Sunscreen',
    subtitle: 'Non-Nano Zinc Oxide + Ceylon Moringa Shield',
    slug: 'mineral-spf-50-sunscreen',
    category: 'Sun Care',
    subcategory: 'Face Sunscreen',
    price: 6800,
    size: '50ml',
    description: 'An imperceptible, silky mineral fluid delivering broad-spectrum UVA/UVB and HEV blue-light defense.',
    longDescription: 'Infused with non-nano micronized Zinc Oxide, moringa seed peptides, and cooling aloe leaf juice. Blends invisibly on all skin tones with zero ghostly cast or greasy finish.',
    ingredients: ['Zinc Oxide 18.5%', 'Moringa Oleifera Seed Extract', 'Aloe Barbadensis Leaf Juice', 'Caprylic/Capric Triglyceride'],
    activeIngredients: [
      { name: 'Non-Nano Zinc Oxide', benefit: 'Safe physical barrier reflecting 98% of harmful UVA and UVB radiation.' },
      { name: 'Moringa Peptides', benefit: 'Forms an invisible shield against urban particulate pollution.' }
    ],
    howToUse: 'Apply generously 15 minutes before sun exposure as the final step of your skincare routine. Reapply every 2 hours.',
    skinTypes: ['All Skin Types', 'Sensitive', 'Normal', 'Oily', 'Dry'],
    concerns: ['Sun Protection', 'Anti-Aging', 'Barrier Repair'],
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviewCount: 165,
    stock: 32,
    lowStockThreshold: 10,
    sku: 'VEL-SUN-005',
    badge: 'BEST SELLER',
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    status: 'In Stock',
    createdAt: '2026-01-10'
  },
  {
    id: 'prod-06',
    name: 'Botanical Repair Shampoo',
    subtitle: 'Hydrolyzed Silk + Rosemary Scalp Actives',
    slug: 'botanical-repair-shampoo',
    category: 'Haircare',
    subcategory: 'Shampoo',
    price: 6200,
    size: '250ml',
    description: 'A sulfate-free botanical cleanser designed to strengthen hair follicles and awaken healthy scalp circulation.',
    longDescription: 'Crafted with rosemary leaf oil, hydrolyzed silk protein, and Ceylon black tea tannins. Gently clears sebum buildup while revitalizing tired roots with an invigorating herbaceous aroma.',
    ingredients: ['Water', 'Sodium Lauroyl Sarcosinate', 'Rosmarinus Officinalis (Rosemary) Leaf Oil', 'Hydrolyzed Silk', 'Biotin'],
    activeIngredients: [
      { name: 'Rosemary Leaf Oil', benefit: 'Clinically proven botanical stimulant for micro-circulation and root density.' },
      { name: 'Hydrolyzed Silk', benefit: 'Rebuilds broken keratin bonds to seal cuticle friction and split ends.' }
    ],
    howToUse: 'Massage into wet scalp for 2 minutes to activate botanical extracts, then glide through mid-lengths and rinse thoroughly.',
    skinTypes: ['All Skin Types'],
    concerns: ['Hair Repair'],
    images: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviewCount: 76,
    stock: 22,
    lowStockThreshold: 8,
    sku: 'VEL-HAR-006',
    badge: 'ORGANIC ACTIVES',
    isNew: false,
    isBestSeller: false,
    isFeatured: true,
    status: 'In Stock',
    createdAt: '2026-02-18'
  },
  {
    id: 'prod-07',
    name: 'Nourishing Hair Mask',
    subtitle: 'Cold-Pressed Argan + Cupuaçu Butter',
    slug: 'nourishing-hair-mask',
    category: 'Haircare',
    subcategory: 'Hair Masks',
    price: 7800,
    size: '200ml',
    description: 'An intensive restructuring butter treatment that restores elasticity and liquid sheen to dry, damaged strands.',
    longDescription: 'A buttery restorative treatment enriched with virgin argan oil, cupuaçu seed butter, and panthenol. Deeply conditions color-treated or heat-stressed hair in just 5 minutes.',
    ingredients: ['Aqua', 'Cetearyl Alcohol', 'Argania Spinosa Kernel Oil', 'Theobroma Grandiflorum Seed Butter', 'Hydrolyzed Keratin'],
    activeIngredients: [
      { name: 'Virgin Argan Oil', benefit: 'Rich in essential fatty acids and Vitamin E to coat strands in glossy hydration.' },
      { name: 'Cupuaçu Butter', benefit: 'Superior moisture retention that restores bouncy movement and manageability.' }
    ],
    howToUse: 'Apply generously to damp, shampooed hair from mid-lengths to ends. Leave for 5-10 minutes before rinsing with cool water.',
    skinTypes: ['All Skin Types'],
    concerns: ['Hair Repair', 'Hydration'],
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviewCount: 53,
    stock: 18,
    lowStockThreshold: 6,
    sku: 'VEL-MSK-007',
    badge: 'BEST SELLER',
    isNew: false,
    isBestSeller: true,
    isFeatured: false,
    status: 'In Stock',
    createdAt: '2026-01-28'
  },
  {
    id: 'prod-08',
    name: 'Silk Touch Body Lotion',
    subtitle: 'Ceylon Black Tea + Shea Butter Elixir',
    slug: 'silk-touch-body-lotion',
    category: 'Body Care',
    subcategory: 'Body Lotion',
    price: 5900,
    size: '250ml',
    description: 'A velvet-finish body lotion formulated with antioxidant Ceylon tea and whipped shea butter.',
    longDescription: 'Hydrates deeply without stickiness, leaving skin with a satin veil and a delicate trace of warm cedarwood and wild fig.',
    ingredients: ['Water', 'Butyrospermum Parkii Butter', 'Camellia Sinensis Leaf Extract', 'Simmondsia Chinensis Seed Oil', 'Niacinamide'],
    activeIngredients: [
      { name: 'Ceylon Black Tea Extract', benefit: 'High in polyphenols that firm the skin and defend against environmental stressors.' },
      { name: 'Raw Shea Butter', benefit: 'Provides long-lasting barrier conditioning and velvety softness.' }
    ],
    howToUse: 'Smooth generously over the entire body right after bathing while skin is still slightly warm and damp.',
    skinTypes: ['All Skin Types', 'Dry', 'Normal'],
    concerns: ['Hydration', 'Barrier Repair'],
    images: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviewCount: 68,
    stock: 25,
    lowStockThreshold: 10,
    sku: 'VEL-BOD-008',
    badge: 'NEW ARRIVAL',
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    status: 'In Stock',
    createdAt: '2026-03-01'
  },
  {
    id: 'prod-09',
    name: 'Overnight Recovery Cream',
    subtitle: '0.3% Encapsulated Retinal + Bakuchiol',
    slug: 'overnight-recovery-cream',
    category: 'Skincare',
    subcategory: 'Moisturizers',
    price: 9400,
    originalPrice: 11000,
    size: '50ml',
    description: 'A breakthrough nocturnal treatment that accelerates cellular renewal without irritation or dryness.',
    longDescription: 'Synergizes micro-encapsulated Retinaldehyde with plant-derived Bakuchiol and soothing Bisabolol to visibly soften fine lines, firm laxity, and restore morning vitality.',
    ingredients: ['Aqua', 'Caprylic/Capric Triglyceride', 'Retinal (0.3%)', 'Bakuchiol', 'Bisabolol', 'Ceramide NP', 'Glycerin'],
    activeIngredients: [
      { name: 'Encapsulated Retinal', benefit: 'Acts up to 11x faster than classic retinol with zero redness.' },
      { name: 'Bakuchiol', benefit: 'Gentle Ayurvedic botanical that works synergistically to stabilize retinal performance.' }
    ],
    howToUse: 'Apply 1-2 pumps at night to clean skin. Begin twice weekly and gradually increase frequency.',
    skinTypes: ['Normal', 'Dry', 'Combination', 'Oily'],
    concerns: ['Anti-Aging', 'Barrier Repair', 'Brightening'],
    images: [
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviewCount: 91,
    stock: 12,
    lowStockThreshold: 5,
    sku: 'VEL-NIT-009',
    badge: 'BEST SELLER',
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    status: 'In Stock',
    createdAt: '2026-01-05'
  },
  {
    id: 'prod-10',
    name: 'Daily Barrier Lotion',
    subtitle: 'Prebiotics + Centella Asiatica Emulsion',
    slug: 'daily-barrier-lotion',
    category: 'Skincare',
    subcategory: 'Moisturizers',
    price: 4500,
    size: '200ml',
    description: 'A light, fast-absorbing daily lotion formulated to balance the microbiome and calm sensitivity.',
    longDescription: 'Blends oat prebiotics with soothing Centella Asiatica (Gotu Kola) to maintain resilient, healthy skin against environmental stress.',
    ingredients: ['Water', 'Glycerin', 'Centella Asiatica Extract', 'Lactobacillus Ferment', 'Allantoin'],
    activeIngredients: [
      { name: 'Oat Prebiotics', benefit: 'Feeds beneficial skin microflora for optimal immune defense.' },
      { name: 'Centella Asiatica', benefit: 'Accelerates micro-wound repair and soothes irritation.' }
    ],
    howToUse: 'Apply 2 pumps evenly to face and neck every morning under sunscreen.',
    skinTypes: ['All Skin Types', 'Sensitive', 'Oily', 'Combination'],
    concerns: ['Barrier Repair', 'Hydration', 'Acne & Blemishes'],
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviewCount: 47,
    stock: 36,
    lowStockThreshold: 10,
    sku: 'VEL-BAR-010',
    badge: 'CLEAN FORMULA',
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    status: 'In Stock',
    createdAt: '2026-02-25'
  },
  {
    id: 'prod-11',
    name: 'The Morning Ritual Discovery Set',
    subtitle: 'Full 4-Step Skincare Ceremony',
    slug: 'the-morning-ritual-discovery-set',
    category: 'Gift Sets',
    subcategory: 'Morning Ritual Kit',
    price: 24500,
    originalPrice: 28900,
    size: '4 Piece Kit',
    description: 'Our award-winning 4-piece ritual boxed in organic textured paper and raw linen ribbon.',
    longDescription: 'Includes: Gentle Cloud Cleanser (50ml), Velvet Glow Serum (30ml), Velora Hydrating Face Cream (30ml), and Mineral SPF 50 (30ml). Everything you need for radiant, perfected skin from sunrise to dusk.',
    ingredients: ['Curated active sets containing pure botanical formulations.'],
    activeIngredients: [
      { name: 'Complete Synergy', benefit: 'Scientifically sequenced to optimize layering without pilling.' }
    ],
    howToUse: 'Follow steps 1 to 4 sequentially every morning: Cleanse -> Treat with Serum -> Hydrate with Cream -> Protect with Mineral SPF.',
    skinTypes: ['All Skin Types'],
    concerns: ['Hydration', 'Brightening', 'Sun Protection', 'Barrier Repair'],
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 5.0,
    reviewCount: 38,
    stock: 10,
    lowStockThreshold: 5,
    sku: 'VEL-SET-011',
    badge: 'LIMITED EDITION',
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    status: 'In Stock',
    createdAt: '2026-03-05'
  },
  {
    id: 'prod-12',
    name: 'Botanical Exfoliating Face Polish',
    subtitle: 'Rice Bran + Bamboo Silicas + Lactic Acid',
    slug: 'botanical-exfoliating-face-polish',
    category: 'Skincare',
    subcategory: 'Face Oils',
    price: 6100,
    size: '75ml',
    description: 'A gentle dual-action enzymatic and micro-physical polish that unveils luminous, baby-soft skin.',
    longDescription: 'Combines micro-milled organic rice bran, bamboo microspheres, and 5% lactic acid. Sweeps away dull surface cells without micro-tearing delicate tissue.',
    ingredients: ['Water', 'Oryza Sativa Bran Wax', 'Bambusa Arundinacea Stem Extract', 'Lactic Acid', 'Jojoba Esters'],
    activeIngredients: [
      { name: 'Micro-Rice Polish', benefit: 'Smooths micro-texture mechanically with spherical non-abrasive particles.' },
      { name: 'Lactic Acid 5%', benefit: 'Gently dissolves intercellular glue while enhancing moisture retention.' }
    ],
    howToUse: 'Massage onto clean, damp skin for 60 seconds with light pressure. Rinse with lukewarm water. Use 2-3 times weekly.',
    skinTypes: ['Normal', 'Combination', 'Oily', 'Dry'],
    concerns: ['Brightening', 'Acne & Blemishes'],
    images: [
      'https://images.unsplash.com/photo-1608248597359-5b4306354897?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviewCount: 42,
    stock: 8,
    lowStockThreshold: 10,
    sku: 'VEL-POL-012',
    badge: 'CLEAN FORMULA',
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    status: 'Low Stock',
    createdAt: '2026-02-10'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'rev-01',
    productId: 'prod-01',
    userName: 'Kavindi Perera',
    userLocation: 'Colombo 07',
    rating: 5,
    date: '2026-03-12',
    title: 'The single best serum I have used in Sri Lanka',
    comment: 'The texture is extraordinarily refined. It sinks in without any tackiness and my skin texture has smoothed noticeably in just 2 weeks. The packaging feels like something from Aesop or Le Labo.',
    verified: true,
    skinType: 'Combination',
    helpfulCount: 24
  },
  {
    id: 'rev-02',
    productId: 'prod-01',
    userName: 'Dilani Samarasinghe',
    userLocation: 'Kandy',
    rating: 5,
    date: '2026-03-08',
    title: 'Unbelievable glass-skin finish',
    comment: 'Finally a brand that understands Sri Lankan humidity! It hydrates deeply without feeling heavy or causing breakouts. I am already ordering my second bottle.',
    verified: true,
    skinType: 'Normal',
    helpfulCount: 19
  },
  {
    id: 'rev-03',
    productId: 'prod-02',
    userName: 'Sachini Wickramasinghe',
    userLocation: 'Galle',
    rating: 5,
    date: '2026-02-28',
    title: 'Saved my damaged barrier completely',
    comment: 'I had severe peeling and redness from over-exfoliation. This cream restored my skin in less than 3 days. So soothing and luxurious.',
    verified: true,
    skinType: 'Dry',
    helpfulCount: 31
  },
  {
    id: 'rev-04',
    productId: 'prod-05',
    userName: 'Amani Jayawardena',
    userLocation: 'Colombo 03',
    rating: 5,
    date: '2026-03-01',
    title: 'Zero white cast on South Asian skin!',
    comment: 'As someone with deeper undertones, mineral sunscreens are usually terrifying. Velora SPF 50 leaves absolutely zero ghostliness. Pure perfection.',
    verified: true,
    skinType: 'Combination',
    helpfulCount: 42
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ord-10482',
    orderNumber: 'VL-10482',
    date: '2026-03-15T14:30:00Z',
    customer: {
      id: 'cust-01',
      name: 'Puvanakopis',
      email: 'puvana@velora.lk',
      phone: '+94 77 123 4567'
    },
    deliveryAddress: {
      id: 'addr-01',
      label: 'Home',
      recipientName: 'Puvanakopis',
      phone: '+94 77 123 4567',
      street: '42 Lotus Road, Havelock Town',
      apartment: 'Apt 4B',
      city: 'Colombo',
      district: 'Colombo',
      postalCode: '00500',
      country: 'Sri Lanka',
      isDefault: true
    },
    items: [
      {
        productId: 'prod-01',
        productName: 'Velvet Glow Serum',
        productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80',
        size: '30ml',
        price: 8900,
        quantity: 2,
        sku: 'VEL-SER-001'
      },
      {
        productId: 'prod-02',
        productName: 'Velora Hydrating Face Cream',
        productImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
        size: '50ml',
        price: 7400,
        quantity: 1,
        sku: 'VEL-CRM-002'
      }
    ],
    subtotal: 25200,
    discount: 0,
    shipping: 450,
    total: 25650,
    status: 'Processing',
    paymentMethod: 'PayHere',
    paymentStatus: 'Paid',
    paymentReference: 'PAY-LK-992140',
    trackingNumber: 'DOM-COL-88912',
    timeline: [
      { status: 'Placed', timestamp: '2026-03-15T14:30:00Z', description: 'Order placed online', completed: true },
      { status: 'Confirmed', timestamp: '2026-03-15T14:32:00Z', description: 'Payment verified via PayHere Gateway', completed: true },
      { status: 'Processing', timestamp: '2026-03-15T16:00:00Z', description: 'Dispatched to fulfillment team', completed: true },
      { status: 'Shipped', timestamp: '', description: 'Handed over to courier partner', completed: false },
      { status: 'Delivered', timestamp: '', description: 'Delivered to customer doorstep', completed: false }
    ]
  },
  {
    id: 'ord-10481',
    orderNumber: 'VL-10481',
    date: '2026-03-14T09:15:00Z',
    customer: {
      id: 'cust-02',
      name: 'Ananya Mendis',
      email: 'ananya@example.com',
      phone: '+94 71 987 6543'
    },
    deliveryAddress: {
      id: 'addr-02',
      label: 'Home',
      recipientName: 'Ananya Mendis',
      phone: '+94 71 987 6543',
      street: '18 Peradeniya Road',
      city: 'Kandy',
      district: 'Kandy',
      postalCode: '20000',
      country: 'Sri Lanka',
      isDefault: true
    },
    items: [
      {
        productId: 'prod-05',
        productName: 'Mineral SPF 50 Sunscreen',
        productImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80',
        size: '50ml',
        price: 6800,
        quantity: 1,
        sku: 'VEL-SUN-005'
      }
    ],
    subtotal: 6800,
    discount: 0,
    shipping: 450,
    total: 7250,
    status: 'Shipped',
    paymentMethod: 'WhatsApp',
    paymentStatus: 'Paid',
    trackingNumber: 'DOM-KDY-12840',
    timeline: [
      { status: 'Placed', timestamp: '2026-03-14T09:15:00Z', description: 'Order initiated via WhatsApp', completed: true },
      { status: 'Confirmed', timestamp: '2026-03-14T09:30:00Z', description: 'Confirmed by Velora Concierge', completed: true },
      { status: 'Processing', timestamp: '2026-03-14T11:00:00Z', description: 'Packed at central facility', completed: true },
      { status: 'Shipped', timestamp: '2026-03-14T15:00:00Z', description: 'In transit with Prompt Xpress', completed: true },
      { status: 'Delivered', timestamp: '', description: 'Estimated delivery tomorrow', completed: false }
    ]
  },
  {
    id: 'ord-10480',
    orderNumber: 'VL-10480',
    date: '2026-03-10T11:20:00Z',
    customer: {
      id: 'cust-03',
      name: 'Rohan Senanayake',
      email: 'rohan.s@gmail.com',
      phone: '+94 76 555 1212'
    },
    deliveryAddress: {
      id: 'addr-03',
      label: 'Office',
      recipientName: 'Rohan Senanayake',
      phone: '+94 76 555 1212',
      street: 'World Trade Center, Level 24, Echelon Square',
      city: 'Colombo',
      district: 'Colombo',
      postalCode: '00100',
      country: 'Sri Lanka',
      isDefault: true
    },
    items: [
      {
        productId: 'prod-11',
        productName: 'The Morning Ritual Discovery Set',
        productImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
        size: '4 Piece Kit',
        price: 24500,
        quantity: 1,
        sku: 'VEL-SET-011'
      }
    ],
    subtotal: 24500,
    discount: 0,
    shipping: 450,
    total: 24950,
    status: 'Delivered',
    paymentMethod: 'PayHere',
    paymentStatus: 'Paid',
    trackingNumber: 'DOM-COL-77219',
    timeline: [
      { status: 'Placed', timestamp: '2026-03-10T11:20:00Z', description: 'Order placed', completed: true },
      { status: 'Confirmed', timestamp: '2026-03-10T11:25:00Z', description: 'Confirmed', completed: true },
      { status: 'Processing', timestamp: '2026-03-10T13:00:00Z', description: 'Processed', completed: true },
      { status: 'Shipped', timestamp: '2026-03-11T09:00:00Z', description: 'Shipped', completed: true },
      { status: 'Delivered', timestamp: '2026-03-12T14:15:00Z', description: 'Signed and delivered', completed: true }
    ]
  }
];

