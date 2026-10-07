import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { ProductModel } from '../models/product.model.js';
import Counter from '../models/counter.model.js';

const initialProducts = [
  {
    _id: 'prod_01',
    name: 'Velvet Glow Serum',
    category: 'Skincare',
    subcategory: 'Serums',
    price: 8900,
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
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 45,
  },
  {
    _id: 'prod_02',
    name: 'Skinova Hydrating Face Cream',
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
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 30,
  },
  {
    _id: 'prod_03',
    name: 'Gentle Cloud Cleanser',
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
    image: 'https://images.unsplash.com/photo-1556228722-d0b5cd03456d?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 50,
  },
  {
    _id: 'prod_04',
    name: 'Radiance Vitamin C Serum',
    category: 'Skincare',
    subcategory: 'Serums',
    price: 9800,
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
    image: 'https://images.unsplash.com/photo-1608248597359-5b4306354897?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 25,
  },
  {
    _id: 'prod_05',
    name: 'Mineral SPF 50 Sunscreen',
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
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 40,
  },
  {
    _id: 'prod_06',
    name: 'Botanical Repair Shampoo',
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
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 35,
  },
  {
    _id: 'prod_07',
    name: 'Nourishing Hair Mask',
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
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 20,
  },
  {
    _id: 'prod_08',
    name: 'Silk Touch Body Lotion',
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
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 18,
  },
  {
    _id: 'prod_09',
    name: 'Overnight Recovery Cream',
    category: 'Skincare',
    subcategory: 'Moisturizers',
    price: 9400,
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
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 15,
  },
  {
    _id: 'prod_10',
    name: 'Daily Barrier Lotion',
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
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 60,
  },
  {
    _id: 'prod_11',
    name: 'The Morning Ritual Discovery Set',
    category: 'Gift Sets',
    subcategory: 'Morning Ritual Kit',
    price: 24500,
    size: '4 Piece Kit',
    description: 'Our award-winning 4-piece ritual boxed in organic textured paper and raw linen ribbon.',
    longDescription: 'Includes: Gentle Cloud Cleanser (50ml), Velvet Glow Serum (30ml), Skinova Hydrating Face Cream (30ml), and Mineral SPF 50 (30ml). Everything you need for radiant, perfected skin from sunrise to dusk.',
    ingredients: ['Curated active sets containing pure botanical formulations.'],
    activeIngredients: [
      { name: 'Complete Synergy', benefit: 'Scientifically sequenced to optimize layering without pilling.' }
    ],
    howToUse: 'Follow steps 1 to 4 sequentially every morning: Cleanse -> Treat with Serum -> Hydrate with Cream -> Protect with Mineral SPF.',
    skinTypes: ['All Skin Types'],
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 12,
  },
  {
    _id: 'prod_12',
    name: 'Botanical Exfoliating Face Polish',
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
    image: 'https://images.unsplash.com/photo-1608248597359-5b4306354897?auto=format&fit=crop&w=1000&q=80',
    rating: null,
    reviewCount: null,
    reviews: null,
    stock: 0,
  },
];

async function seedProducts() {
  try {
    await connectDB();

    console.log('[Seed Products]: Resetting and updating product catalog...');

    // Synchronize schema indexes and drop stale legacy indexes
    try {
      await ProductModel.syncIndexes();
      console.log('[Seed Products]: Synchronized indexes with ProductSchema.');
    } catch (idxErr) {
      console.warn('[Seed Products]: Note on syncIndexes:', idxErr.message);
    }

    for (const prod of initialProducts) {
      await ProductModel.findByIdAndUpdate(
        prod._id,
        { $set: prod, $unset: { status: 1 } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    // Update counter sequence so subsequent products start from prod_13
    await Counter.findByIdAndUpdate(
      'product',
      { $set: { seq: initialProducts.length } },
      { upsert: true }
    );

    const totalInDb = await ProductModel.countDocuments();
    console.log(`[Seed Products]: Successfully seeded ${initialProducts.length} luxury products with null ratings/reviews. Total in DB: ${totalInDb}`);
  } catch (error) {
    console.error('[Seed Products Error]:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seedProducts();
