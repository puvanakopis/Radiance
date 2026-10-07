import { Category, ProductCategory } from '@/types';

export const CATEGORIES_METADATA: Omit<Category, 'itemCount'>[] = [
  {
    id: 'cat-skincare',
    name: 'Skincare',
    slug: 'skincare',
    description: 'Intentional formulations enriched with cold-pressed botanicals, hyaluronic acid, and active barrier lipids.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Cleansers', 'Serums', 'Moisturizers', 'Eye Care', 'Face Oils', 'Masks']
  },
  {
    id: 'cat-haircare',
    name: 'Haircare',
    slug: 'haircare',
    description: 'Nutrient-rich botanical haircare crafted for weightless hydration, scalp vitality, and silk-like shine.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Shampoo', 'Conditioner', 'Hair Masks', 'Scalp Treatments', 'Hair Elixirs']
  },
  {
    id: 'cat-body',
    name: 'Body Care',
    slug: 'body-care',
    description: 'Sensory body rituals powered by Ceylon tea seed oil, rich shea butter, and velvety botanical waxes.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Body Lotion', 'Body Wash', 'Hand Care', 'Body Exfoliators', 'Body Oils']
  },
  {
    id: 'cat-suncare',
    name: 'Sun Care',
    slug: 'sun-care',
    description: 'Invisible, reef-safe broad spectrum defense that melts effortlessly without white cast or greasiness.',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Face Sunscreen', 'Body Sunscreen', 'Tinted Mineral SPF', 'After-Sun Mist']
  },
  {
    id: 'cat-giftsets',
    name: 'Gift Sets',
    slug: 'gift-sets',
    description: 'Curated ritual boxes hand-packaged with reusable linen wraps and botanical essentials.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Morning Ritual Kit', 'Night Repair Bundle', 'Discovery Set', 'The Complete Collection']
  }
];
