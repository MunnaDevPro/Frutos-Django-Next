import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getOfferBySlug } from '@/lib/api_product';
import ProductCard from '@/app/components/ProductCard';

export const dynamic = 'force-dynamic';

// ─── Countdown Timer (Server-side renders deadline, client-side will hydrate) ─
function OfferBadge({ endDate }) {
  if (!endDate) return null;
  const deadline = new Date(endDate);
  const now = new Date();
  const diff = deadline - now;
  if (diff <= 0) return <span className="bg-gray-500/90 text-white px-4 py-1.5 rounded-full text-sm font-semibold">Offer Ended</span>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full font-semibold text-sm shadow-lg">
      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
      <span>Ends in&nbsp;</span>
      {days > 0 && <span className="text-red-300 font-bold">{days}d&nbsp;</span>}
      <span className="text-red-300 font-bold">{hours}h</span>
      &nbsp;· <span className="text-gray-300 text-xs">{deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default async function OfferDetailPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const offer = await getOfferBySlug(slug).catch(() => null);

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Offer Not Found</h1>
          <p className="text-gray-500 mb-6">This offer does not exist or has expired.</p>
          <Link href="/offers" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-emerald-700 transition-colors">
            ← View All Offers
          </Link>
        </div>
      </div>
    );
  }

  const products = offer.products || [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--section-color, #f7faf7)' }}>

      {/* ── Hero Banner ── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '21/7', minHeight: '220px', maxHeight: '520px' }}>
        {offer.image ? (
          <Image
            src={offer.image}
            alt={offer.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-700" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Decorative animated circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/offers" className="hover:text-white transition-colors">Offers</Link>
            <span>/</span>
            <span className="text-white/90 truncate max-w-[200px]">{offer.title}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {offer.title}
          </h1>

          {offer.description && (
            <p
              className="text-base md:text-lg max-w-2xl text-white/80 drop-shadow mb-5 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: offer.description }}
            />
          )}

          <OfferBadge endDate={offer.endDate} />
        </div>
      </div>

      {/* ── Product Stats Bar ── */}
      {products.length > 0 && (
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Products</p>
                  <p className="text-sm font-bold text-gray-900">{products.length} items</p>
                </div>
              </div>

              {offer.endDate && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Offer valid till</p>
                    <p className="text-sm font-bold text-red-600">
                      {new Date(offer.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Link href="/offers" className="flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              All Offers
            </Link>
          </div>
        </div>
      )}

      {/* ── Products Grid ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-12">
        {products.length > 0 ? (
          <>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2
                  className="text-2xl md:text-3xl font-bold text-gray-900"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  Offer Products
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Special prices available for a limited time only
                </p>
              </div>

              {/* Decorative tag */}
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/>
                </svg>
                Exclusive offer prices
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Yet</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              Products for this offer haven&apos;t been added yet. Check back soon!
            </p>
            <Link href="/products" className="mt-6 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-emerald-700 transition-colors">
              Browse All Products
            </Link>
          </div>
        )}
      </div>

      {/* ── Related Offers CTA ── */}
      <div className="border-t border-gray-200 bg-white mt-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-10 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Explore More Offers</h3>
          <p className="text-gray-500 text-sm mb-5">Discover other exciting deals and promotions available right now.</p>
          <Link
            href="/offers"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/>
            </svg>
            View All Offers
          </Link>
        </div>
      </div>
    </div>
  );
}
