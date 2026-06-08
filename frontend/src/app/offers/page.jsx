import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOffers } from '@/lib/api_product';

export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  const offers = await getOffers().catch(() => []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Special Offers</h1>
      
      {offers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No active offers available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <Link key={offer.id} href={`/offers/${offer.slug}`} className="block group">
              <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 aspect-[16/9] bg-gray-100">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-lg">{offer.title}</h3>
                </div>

                {offer.endDate && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-red-600 shadow-sm border border-red-100">
                    Limited Time
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
