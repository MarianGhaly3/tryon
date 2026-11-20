import type { Category, Look, Product } from '../types';

export const CATEGORIES = ['All', 'Glasses', 'Earrings', 'Necklaces', 'Makeup'] as const;

/** The catalog of the ÉCLAT design, unchanged. */
export const PRODUCTS: Product[] = [
  { id: 1, name: 'ÉCLAT Rose Sunglasses', category: 'Glasses', price: 129, rating: 4.8, reviews: 320, art: 'rose', color: 'Rose', brand: 'ÉCLAT', style: 'Cat Eye', tag: 'Bestseller' },
  { id: 2, name: 'Luxe Cat Eye', category: 'Glasses', price: 149, rating: 4.7, reviews: 218, art: 'black', color: 'Black', brand: 'LuxeEye', style: 'Cat Eye', tag: 'Trending' },
  { id: 6, name: 'Vintage Round', category: 'Glasses', price: 119, rating: 4.8, reviews: 412, art: 'tortoise', color: 'Brown', brand: 'RayVision', style: 'Round', tag: 'Bestseller' },
  { id: 10, name: 'Classic Metal', category: 'Glasses', price: 99, rating: 4.6, reviews: 176, art: 'wire', color: 'Gold', brand: 'ÉCLAT', style: 'Eyeglasses', tag: 'New' },
  { id: 3, name: 'Golden Hoop Earrings', category: 'Earrings', price: 59, rating: 4.9, reviews: 533, art: 'hoops', color: 'Gold', brand: 'ÉCLAT', style: 'Elegant', tag: 'Bestseller' },
  { id: 7, name: 'Flower Drop Earrings', category: 'Earrings', price: 69, rating: 4.8, reviews: 286, art: 'hoops', color: 'Gold', brand: 'GlowBeauty', style: 'Elegant', tag: 'New' },
  { id: 4, name: 'Daisy Pendant Necklace', category: 'Necklaces', price: 89, rating: 4.9, reviews: 397, art: 'necklace', color: 'Gold', brand: 'ÉCLAT', style: 'Elegant', tag: 'Bestseller' },
  { id: 5, name: 'Matte Lipstick – Rose', category: 'Makeup', price: 29, rating: 4.7, reviews: 621, art: 'lipstick', color: 'Rose', brand: 'GlowBeauty', style: 'Casual', tag: 'Trending' },
  { id: 11, name: 'Sunset Round Sunglasses', category: 'Glasses', price: 109, rating: 4.8, reviews: 204, art: 'round', color: 'Brown', brand: 'RayVision', style: 'Round', tag: 'New' },
  { id: 12, name: 'Blush Cat Eye', category: 'Glasses', price: 119, rating: 4.9, reviews: 189, art: 'pink', color: 'Rose', brand: 'LuxeEye', style: 'Cat Eye', tag: 'New' },
  { id: 13, name: 'Olive Aviator', category: 'Glasses', price: 139, rating: 4.8, reviews: 168, art: 'green', color: 'Green', brand: 'RayVision', style: 'Aviator', tag: 'Trending' },
  { id: 14, name: 'Midnight Statement', category: 'Glasses', price: 129, rating: 4.7, reviews: 207, art: 'black', color: 'Black', brand: 'LuxeEye', style: 'Sunglasses', tag: 'Classic' },
  { id: 8, name: 'Golden Bloom Pendant', category: 'Necklaces', price: 95, rating: 4.9, reviews: 219, art: 'necklace', color: 'Gold', brand: 'ÉCLAT', style: 'Elegant', tag: 'Exclusive' },
  { id: 9, name: 'Velvet Lipstick – Berry', category: 'Makeup', price: 28, rating: 4.7, reviews: 253, art: 'lipstick', color: 'Rose', brand: 'GlowBeauty', style: 'Elegant', tag: 'Popular' },
];

export const product = (id: number | string | null | undefined) => PRODUCTS.find((p) => p.id === Number(id));
export const productsOf = (category: Category) => PRODUCTS.filter((p) => p.category === category);

/** Sample looks shown until the visitor saves their own. */
export const DEMO_LOOKS: Look[] = [
  { id: 'demo-1', name: 'Casual Chic', art: 'look1', ids: [1, 3, 4, 5], date: '2026-11-10', favorite: true },
  { id: 'demo-2', name: 'Evening Glow', art: 'look2', ids: [3, 4, 5], date: '2026-11-08' },
  { id: 'demo-3', name: 'Modern Edge', art: 'look3', ids: [2, 3], date: '2026-11-05' },
  { id: 'demo-4', name: 'Elegant Look', art: 'look4', ids: [3, 4, 5], date: '2026-11-02' },
  { id: 'demo-5', name: 'Soft Pink Look', art: 'look2', ids: [12, 4, 5], date: '2026-10-29' },
  { id: 'demo-6', name: 'Party Look', art: 'look1', ids: [1, 3, 4], date: '2026-10-25' },
];
