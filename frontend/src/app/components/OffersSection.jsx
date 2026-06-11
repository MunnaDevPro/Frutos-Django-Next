import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function OffersSection({ offers }) {
  if (!offers || offers.length === 0) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-8 md:py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', fontWeight: 700, color: '#151E13' }}>
          Special Offers
        </h2>
        <Link href="/offers" className="text-[#00694C] font-medium hover:underline text-[14px]">
          View All Offers
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {offers.slice(0, 6).map((offer) => (
          <Link key={offer.id} href={`/offers/${offer.slug}`} className="block group">
            <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 aspect-[16/9] bg-gray-100">
              <Image
                src={offer.image}
                alt={offer.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {offer.endDate && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-sm font-bold text-red-600 shadow-sm">
                  Limited Time
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
