'use client';

import React from 'react';
import Link from 'next/link';
import { Flower2, Leaf, ShieldCheck, Heart, Droplets, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function AboutPage() {
  const pillars = [
    {
      icon: Leaf,
      title: 'Indigenous Botanical Actives',
      description: 'We harvest nutrient-dense, high-elevation Ceylon green tea, wild moringa, and cold-pressed botanical oils from ethical grower cooperatives in Sri Lanka.'
    },
    {
      icon: Droplets,
      title: 'Pharmaceutical Efficacy',
      description: 'Every formulation is enriched with proven dermatological actives—such as encapsulated retinal, multi-weight hyaluronic acid, and skin-identical ceramides.'
    },
    {
      icon: ShieldCheck,
      title: 'Biocompatible & Non-Comedogenic',
      description: 'Formulated specifically for high-humidity and tropical climates. Zero parabens, sulfates (SLS/SLES), phthalates, mineral oils, or synthetic fragrances.'
    },
    {
      icon: Heart,
      title: '100% Cruelty-Free & Conscious',
      description: 'Never tested on animals. Packaged in recyclable UV-protected amber glass and post-consumer recycled paper with soy inks.'
    }
  ];

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20 sm:space-y-32">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Our Philosophy & Story' }]} />

      {/* Hero Editorial Header */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE3D9]/60 border border-[#1A1A1A]/5 text-[#1A1A1A]">
          <Flower2 className="w-3.5 h-3.5 text-[#C87D55] stroke-[1.75]" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium">
            The Skinova Genesis
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#1A1A1A] leading-[1.08]">
          Beauty, <br />
          <span className="italic font-light text-[#2B2523]">thoughtfully</span> made.
        </h1>

        <p className="text-base sm:text-lg text-[#1A1A1A]/75 font-light leading-relaxed max-w-2xl mx-auto">
          Born from the intersection of Ceylon’s restorative flora and modern clinical dermatology, SKINOVA crafts daily rituals that celebrate equilibrium, transparency, and cellular health.
        </p>
      </section>

      {/* Editorial Split Story Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-6 double-bezel-outer shadow-2xl">
          <div className="double-bezel-inner aspect-[4/5] rounded-[calc(1.75rem-0.375rem)] overflow-hidden bg-[#1A1A1A]">
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80"
              alt="Skinova cleanroom and formulation craft"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6 text-left">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#C87D55] block">
            Our Purpose & Ethos
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] leading-tight">
            Restoring the relationship between your skin and nature.
          </h2>
          <p className="text-sm text-[#1A1A1A]/75 leading-relaxed font-light">
            In 2024, our founders noticed a persistent gap: tropical skin was either subjected to overly heavy European occlusives or harsh astringents that stripped the delicate moisture barrier.
          </p>
          <p className="text-sm text-[#1A1A1A]/75 leading-relaxed font-light">
            We set out to build formulations that honor climate biology. By cold-extracting potent polyphenols from high-elevation Sri Lankan tea estates and stabilizing them alongside pharmaceutical peptides, we created formulas that sink in instantly without residue.
          </p>

          <div className="p-5 rounded-2xl bg-[#EAE3D9]/40 border border-[#1A1A1A]/5 space-y-1">
            <p className="font-serif text-base italic text-[#1A1A1A]">
              "We do not promise instant miracles. We engineer sustainable dermal harmony through intentional daily rituals."
            </p>
            <span className="text-[11px] uppercase tracking-wider text-[#1A1A1A]/60 block pt-1">
              — The Skinova Formulation Collective, Colombo
            </span>
          </div>
        </div>
      </section>

      {/* Brand Pillars Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C87D55] block">
            Core Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">
            The Skinova Four Pillars
          </h2>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/60 font-light">
            Strict formulation guidelines guiding every bottle that leaves our facility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-7 shadow-xs space-y-4 text-left flex flex-col justify-between hover:border-[#1A1A1A]/25 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EAE3D9]/60 flex items-center justify-center text-[#1A1A1A]">
                  <Icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">{pillar.title}</h3>
                  <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-white border border-[#1A1A1A]/10 rounded-3xl sm:rounded-[2.5rem] p-10 sm:p-16 text-center space-y-6 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C87D55] block">
            Experience The Difference
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A] leading-tight">
            Discover your skin’s everyday equilibrium.
          </h2>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/70 font-light leading-relaxed">
            Browse our complete spectrum of cleansers, barrier emulsions, serums, and sun care.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button variant="terracotta" size="lg" icon={ArrowRight}>
                Shop All Formulations
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Concierge
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
