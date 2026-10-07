import React from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { whatsappService } from '@/services/whatsappService';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1A1A] text-[#FAF8F5] pt-16 pb-12 border-t border-white/10 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C87D55]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#FAF8F5]">
                SKINOVA
              </span>
              <span className="text-[8px] uppercase tracking-[0.25em] text-[#FAF8F5]/50 block mt-0.5">
                Botanical Aesthetics • Colombo
              </span>
            </Link>
            <p className="text-xs text-[#FAF8F5]/60 max-w-sm leading-relaxed">
              Formulated with high-elevation Ceylon botanicals and biocompatible clinical actives to foster radiant equilibrium and everyday resilience.
            </p>
            <div className="pt-2">
              <span className="text-[11px] text-[#C87D55] font-medium tracking-wider uppercase block">
                Direct WhatsApp Concierge:
              </span>
              <a
                href={whatsappService.getDirectChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#FAF8F5]/80 hover:text-white mt-1 underline underline-offset-4"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                {whatsappService.getFormattedDisplayNumber()} (10:00 - 19:00 IST)
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FAF8F5]">
              Formulations
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/60">
              <li>
                <Link href="/products?category=Skincare" className="hover:text-[#FAF8F5] transition-colors">
                  Skincare
                </Link>
              </li>
              <li>
                <Link href="/products?category=Haircare" className="hover:text-[#FAF8F5] transition-colors">
                  Haircare
                </Link>
              </li>
              <li>
                <Link href="/products?category=Body%20Care" className="hover:text-[#FAF8F5] transition-colors">
                  Body Care
                </Link>
              </li>
              <li>
                <Link href="/products?category=Sun%20Care" className="hover:text-[#FAF8F5] transition-colors">
                  Sun Defense
                </Link>
              </li>
              <li>
                <Link href="/products?category=Gift%20Sets" className="hover:text-[#FAF8F5] transition-colors">
                  Ritual Gift Sets
                </Link>
              </li>
            </ul>
          </div>

          {/* House */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FAF8F5]">
              The House
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/60">
              <li>
                <Link href="/about" className="hover:text-[#FAF8F5] transition-colors">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#FAF8F5] transition-colors">
                  Botanical Sourcing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FAF8F5] transition-colors">
                  Client Concierge
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FAF8F5] transition-colors">
                  Stockists & Spas
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Sanctuary */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FAF8F5]">
              Sanctuary
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/60">
              <li>
                <Link href="/account" className="hover:text-[#FAF8F5] transition-colors">
                  Account Overview
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#FAF8F5] transition-colors">
                  Saved Rituals
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#FAF8F5] transition-colors">
                  Your Bag
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-[#C87D55] hover:text-[#C87D55]/80 transition-colors">
                  Staff Control Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FAF8F5]/40">
          <p>© {new Date().getFullYear()} SKINOVA BOTANICALS (PVT) LTD. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-[#FAF8F5] transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-[#FAF8F5] transition-colors cursor-pointer">
              Terms of Ritual
            </span>
            <span className="hover:text-[#FAF8F5] transition-colors cursor-pointer">
              Islandwide Shipping Guide
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
