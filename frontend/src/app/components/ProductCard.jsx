'use client'
// src/app/components/ProductCard.jsx
import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { slugify } from '@/app/lib/slugify'
import { useWishlist } from '@/app/context/WishlistContext'
import { useAuth } from '@/app/context/AuthContext'
import { useCart } from '@/app/context/CartContext'

const STUDIO_FALLBACK_IMAGES = [
  '/homepage/prod_apple.jpg',
  '/homepage/prod_mango.jpg',
  '/homepage/prod_grapes.jpg',
  '/homepage/prod_orange.jpg',
  '/homepage/prod_strawberry.jpg',
]

function pickFallbackImage(product, index) {
  const name = (product?.displayName || product?.name || '').toLowerCase()
  if (name.includes('apple')) return '/homepage/prod_apple.jpg'
  if (name.includes('mango')) return '/homepage/prod_mango.jpg'
  if (name.includes('grape')) return '/homepage/prod_grapes.jpg'
  if (name.includes('orange') || name.includes('citrus')) return '/homepage/prod_orange.jpg'
  if (name.includes('strawberr') || name.includes('berry')) return '/homepage/prod_strawberry.jpg'
  if (typeof index === 'number' && index >= 0) {
    return STUDIO_FALLBACK_IMAGES[index % STUDIO_FALLBACK_IMAGES.length]
  }
  const idStr = String(product?.id || name || '0')
  let hash = 0
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0
  }
  return STUDIO_FALLBACK_IMAGES[hash % STUDIO_FALLBACK_IMAGES.length]
}

// ── Heart / Wishlist button ────────────────────────────────────────────────────
function WishlistButton({ product, variant = 'overlay' }) {
  const { isAuthenticated } = useAuth()
  const { isSaved, toggle } = useWishlist()
  const [localSaved, setLocalSaved] = useState(false)
  const [animating, setAnimating] = useState(false)

  const saved = isAuthenticated ? isSaved(product.id) : localSaved

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    setAnimating(true)
    if (isAuthenticated) {
      toggle(product)
    } else {
      setLocalSaved((prev) => !prev)
    }
    setTimeout(() => setAnimating(false), 260)
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        className="shrink-0 p-0.5 text-[#889287] hover:text-[#17361E] transition-colors cursor-pointer bg-transparent border-none"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={saved ? '#E53935' : 'none'}
          stroke={saved ? '#E53935' : '#8A9488'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={saved ? 'Remove from saved' : 'Save for later'}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: 'transparent',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        transform: animating ? 'scale(1.22)' : 'scale(1)',
        transition: 'transform 0.2s ease',
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={saved ? '#E53935' : 'none'}
        stroke={saved ? '#E53935' : '#253827'}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}

// ── Main ProductCard ──────────────────────────────────────────────────────────
export default function ProductCard({ product, index, notified, onNotify }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)
  const { items, addItem } = useCart()

  const slug = product.slug || slugify(product.name || product.displayName || 'product')
  const {
    name,
    displayName,
    badge,
    unit,
    price,
    displayPrice: customDisplayPrice,
    oldPrice,
    wholesalePrice,
    minWholesaleQty = 1,
    inStock = true,
    image,
    onSale,
  } = product

  const shownTitle = displayName || name
  const fallbackImg = useMemo(() => pickFallbackImage(product, index), [product, index])
  const isPlaceholder = !image || image.includes('placehold.co')
  const resolvedImage = imgError || isPlaceholder ? fallbackImg : image

  const isUnlimited = Boolean(
    product.is_unlimited_stock ||
      product.isUnlimitedStock ||
      product.is_unlimited_wholesale_stock ||
      product.is_unlimited_restaurant_stock
  )
  const effectiveInStock = isUnlimited || inStock !== false

  const rawPrice = customDisplayPrice != null ? customDisplayPrice : price
  const displayPrice = Number(wholesalePrice ? wholesalePrice : rawPrice || 2.5)
  const isWholesalePrice = !!wholesalePrice
  const unitLabel = unit ? unit.replace(/^\/\s*/, '') : 'kg'

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!effectiveInStock) {
      onNotify?.()
      return
    }

    const existingItem = items.find(
      (i) => i.id === product.id && (i.item_type || 'product') === (product.item_type || 'product')
    )
    const currentCartQty = existingItem ? existingItem.qty : 0
    let finalQty = 1
    if (isWholesalePrice && currentCartQty === 0 && minWholesaleQty > 1) {
      finalQty = minWholesaleQty
    }

    addItem({ ...product, name: shownTitle, image: resolvedImage }, displayPrice, finalQty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <Link
      href={'/products/' + slug}
      className="block group w-full min-w-0"
      onClick={() => setIsNavigating(true)}
    >
      <div
        className={
          'flex flex-col w-full min-w-0 rounded-[16px] p-3 transition-all duration-200 hover:-translate-y-0.5 ' +
          (isNavigating ? 'opacity-60 scale-[0.98]' : '')
        }
        style={{
          backgroundColor: '#F6F4EA',
          border: '1px solid #DFDBC8',
          boxShadow: '0 3px 12px rgba(22, 47, 27, 0.05)',
        }}
      >
        {/* ── Top Studio Image Box ── */}
        <div
          className="relative w-full aspect-[4/3] rounded-[12px] overflow-hidden flex-shrink-0 mb-2.5"
          style={{ backgroundColor: '#FAF9F4' }}
        >
          <Image
            src={resolvedImage}
            alt={shownTitle}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Top-right Wishlist Heart */}
          <WishlistButton product={product} variant="overlay" />

          {/* Out of stock overlay */}
          {!effectiveInStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-white text-[#172819] text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* ── Product Info Body ── */}
        <div className="flex flex-col flex-1 px-0.5 min-w-0">
          {/* Title Row + secondary small heart */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3
              className="truncate group-hover:text-[#17361E] transition-colors"
              style={{
                fontFamily: 'var(--font-newsreader), "Playfair Display", Georgia, serif',
                fontSize: '16.5px',
                fontWeight: 700,
                color: '#172819',
                lineHeight: 1.22,
              }}
            >
              {shownTitle}
            </h3>
            <WishlistButton product={product} variant="inline" />
          </div>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 500,
                color: '#253326',
              }}
            >
              ${displayPrice.toFixed(2)}/{unitLabel}
            </span>
            {oldPrice && Number(oldPrice) > displayPrice && (
              <span className="text-[11.5px] text-[#8B9489] line-through">
                ${Number(oldPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Pill Button (Matching Reference Proportion & Color) */}
          <div className="mt-auto" onClick={(e) => e.preventDefault()}>
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full inline-flex items-center justify-center gap-1.5 text-white font-medium transition-all duration-200 cursor-pointer active:scale-[0.98]"
              style={{
                backgroundColor: added ? '#17361E' : '#4E5D4E',
                fontSize: '12px',
                padding: '6.5px 16px',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                if (!added) e.currentTarget.style.backgroundColor = '#2F4332'
              }}
              onMouseLeave={(e) => {
                if (!added) e.currentTarget.style.backgroundColor = '#4E5D4E'
              }}
            >
              {added ? (
                <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Added</span>
                </>
              ) : effectiveInStock ? (
                <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span>Add to Cart</span>
                </>
              ) : (
                <span>{notified ? 'Notified ✓' : 'Notify Me'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
