import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/context/ToastContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'VELORA | Conscious Botanical Skincare & Luxury Beauty Rituals',
  description: 'Pure, clinically efficacious botanical skincare, haircare, and body rituals thoughtfully crafted with Sri Lankan bio-actives.',
  keywords: ['skincare', 'botanicals', 'cosmetics', 'luxury beauty', 'Sri Lanka', 'clean beauty', 'serum', 'moisturizer'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] antialiased selection:bg-[#C87D55]/20 selection:text-[#1A1A1A]">
        {/* Subtle Luxury Film Grain Overlay */}
        <div className="grain-overlay" aria-hidden="true" />
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <CartDrawer />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
