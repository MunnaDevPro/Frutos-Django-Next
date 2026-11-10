'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/app/context/AuthContext'
import { getFrutasCategoryName, checkIsInternalWholesale } from '@/lib/categoryHelper'
import ProductCard from '@/app/components/ProductCard'
import Link from 'next/link'

// ── 5 Signature Category Strip Items (Professional Duotone UI Icons) ─────────
const CATEGORY_STRIP_ITEMS = [
  {
    id: 'Fruits',
    label: 'Fruits',
    subtitle: 'Fresh Orchard',
    keywords: ['fruit', 'fruta', 'apple', 'mango', 'grape', 'orange', 'berry', 'banana'],
    icon: (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft Duotone Accent Fill */}
        <path
          d="M12 7.2C9.2 5.8 5.5 7.3 5.5 12C5.5 16.5 8.5 20.5 11 20.5C11.6 20.5 11.8 20.2 12 20.2C12.2 20.2 12.4 20.5 13 20.5C15.5 20.5 18.5 16.5 18.5 12C18.5 7.3 14.8 5.8 12 7.2Z"
          fill="#E4B34C"
          fillOpacity="0.28"
        />
        <path
          d="M12.2 6.5C12.2 4.2 14.2 2.8 16.5 3.2C16.5 5.4 14.6 6.8 12.2 6.5Z"
          fill="#5B8F52"
          fillOpacity="0.35"
        />
        {/* Precision Architectural Linework */}
        <path
          d="M12 7.2C9.2 5.8 5.5 7.3 5.5 12C5.5 16.5 8.5 20.5 11 20.5C11.6 20.5 11.8 20.2 12 20.2C12.2 20.2 12.4 20.5 13 20.5C15.5 20.5 18.5 16.5 18.5 12C18.5 7.3 14.8 5.8 12 7.2Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.2V4.5C12 3.7 12.6 3 13.5 3"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M12.2 6.5C12.2 4.2 14.2 2.8 16.5 3.2C16.5 5.4 14.6 6.8 12.2 6.5Z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 10.5C8 12 8.2 14.5 9.2 16.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />
      </svg>
    ),
  },
  {
    id: 'Vegetables',
    label: 'Vegetables',
    subtitle: 'Farm Harvest',
    keywords: ['vegetable', 'vagitable', 'verdura', 'carrot', 'tomato', 'broccoli', 'pepper', 'crisp'],
    icon: (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft Duotone Accent Fill */}
        <path
          d="M11.6 7.8C13.1 6.3 15.6 6.3 17.1 7.8C18.6 9.3 18.6 11.8 17.1 13.3L6.8 20.2C5.9 20.8 4.8 20.7 4.3 20.2C3.8 19.7 3.7 18.6 4.3 17.7L11.6 7.8Z"
          fill="#E58A35"
          fillOpacity="0.28"
        />
        {/* Leafy Crown */}
        <path
          d="M16.5 8.5C16.5 5.8 18.2 4 20 4C20 5.8 18.8 7.5 16.5 8.5Z"
          fill="#5B8F52"
          fillOpacity="0.35"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.8 8.8C18.8 7.2 20.8 7.2 21.5 8.2C20.5 9.6 18.8 9.8 16.8 8.8Z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.8 7.8C15 5.8 15.2 4 16.2 3.2"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
        />
        {/* Carrot Body */}
        <path
          d="M11.6 7.8C13.1 6.3 15.6 6.3 17.1 7.8C18.6 9.3 18.6 11.8 17.1 13.3L6.8 20.2C5.9 20.8 4.8 20.7 4.3 20.2C3.8 19.7 3.7 18.6 4.3 17.7L11.6 7.8Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Crisp Root Detail Lines */}
        <path
          d="M11.8 9.8L13.5 11.5M9.2 13.2L11 15M6.8 16.5L8.1 17.8"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'Dairy',
    label: 'Dairy',
    subtitle: 'Pure & Creamy',
    keywords: ['dairy', 'milk', 'cheese', 'butter', 'yogurt', 'valencia'],
    icon: (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft Duotone Accent Fill */}
        <path
          d="M7 11.5L9 7.5H15L17 11.5V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V11.5Z"
          fill="#7AA668"
          fillOpacity="0.24"
        />
        {/* Artisanal Milk Bottle Neck & Cap */}
        <path
          d="M8.5 4H15.5M9.2 4V7.5H14.8V4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottle Body */}
        <path
          d="M7 11.5L9.2 7.5H14.8L17 11.5V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V11.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Milk Level Wave & Fresh Drop */}
        <path
          d="M7.2 13.5C9 12.6 10.8 14.4 12.5 13.5C14.2 12.6 15.5 14 16.8 13.5"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinecap="round"
        />
        <path
          d="M12 16C11.3 16.9 11.2 17.8 12 18.3C12.8 17.8 12.7 16.9 12 16Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 'Organic',
    label: 'Organic',
    subtitle: '100% Natural',
    keywords: ['organic', 'bio', 'natural', 'fresh', 'golden'],
    icon: (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft Duotone Accent Fill */}
        <path
          d="M12 3.5C8 7 7.2 12.2 12 19C16.8 12.2 16 7 12 3.5Z"
          fill="#6FA35B"
          fillOpacity="0.26"
        />
        <path
          d="M12 19.5C6.8 19 3.8 14.8 4.2 10C9 10.4 11.2 13.8 12 19.5Z"
          fill="#E4B34C"
          fillOpacity="0.26"
        />
        {/* Botanical Eco Leaves */}
        <path
          d="M12 3.5C8 7 7.2 12.2 12 19C16.8 12.2 16 7 12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 19.5C6.8 19 3.8 14.8 4.2 10C9 10.4 11.2 13.8 12 19.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 19.5C17.2 19 20.2 14.8 19.8 10C15 10.4 12.8 13.8 12 19.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 10V21.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'Others',
    label: 'Others',
    subtitle: 'Pantry & More',
    keywords: ['other', 'pack', 'sale', 'box', 'sweet'],
    icon: (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft Duotone Accent Fill */}
        <path
          d="M4.8 10.5H19.2L17.6 19.2C17.4 20.1 16.6 20.8 15.6 20.8H8.4C7.4 20.8 6.6 20.1 6.4 19.2L4.8 10.5Z"
          fill="#E4B34C"
          fillOpacity="0.28"
        />
        {/* Market Basket Rim & Handles */}
        <path
          d="M3.5 10.5H20.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8.2 10.5L10.5 4.8M15.8 10.5L13.5 4.8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Basket Body */}
        <path
          d="M4.8 10.5L6.4 19.2C6.6 20.1 7.4 20.8 8.4 20.8H15.6C16.6 20.8 17.4 20.1 17.6 19.2L19.2 10.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Woven Basket Ribs */}
        <path
          d="M9.5 13.8V17.5M12 13.8V17.5M14.5 13.8V17.5"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

// 8 Curated Showcase Templates (First 5 match the 5 cards in the reference image 100%)
const SHOWCASE_TEMPLATES = [
  { name: 'Apple', price: 2.50, unit: 'kg', category: 'Fruits', image: '/homepage/prod_apple.jpg' },
  { name: 'Mango', price: 3.00, unit: 'kg', category: 'Fruits', image: '/homepage/prod_mango.jpg' },
  { name: 'Grapes', price: 2.80, unit: 'kg', category: 'Fruits', image: '/homepage/prod_grapes.jpg' },
  { name: 'Orange', price: 2.10, unit: 'kg', category: 'Fruits', image: '/homepage/prod_orange.jpg' },
  { name: 'Strawberry', price: 4.50, unit: 'kg', category: 'Fruits', image: '/homepage/prod_strawberry.jpg' },
  { name: 'Golden Mango', price: 3.20, unit: 'kg', category: 'Organic', image: '/homepage/prod_mango.jpg' },
  { name: 'Crisp Red Apple', price: 2.60, unit: 'kg', category: 'Vegetables', image: '/homepage/prod_apple.jpg' },
  { name: 'Valencia Orange', price: 2.30, unit: 'kg', category: 'Dairy', image: '/homepage/prod_orange.jpg' },
]

export default function ProductGrid({
  initialProducts = [],
  categories = [],
  isInternalWholesaleUser: initialIsInternalWholesale = false,
  offersSlot = null,
}) {
  const [products, setProducts] = useState(initialProducts)
  const { data: session } = useSession()
  const { user } = useAuth()
  const isInternalWholesale = initialIsInternalWholesale || checkIsInternalWholesale(session, user)

  const frutasCat = useMemo(() => getFrutasCategoryName(categories), [categories])

  const [active, setActive] = useState(() =>
    initialIsInternalWholesale && frutasCat ? frutasCat : 'All'
  )
  const userManuallyChangedRef = useRef(false)

  useEffect(() => {
    if (isInternalWholesale && frutasCat && !userManuallyChangedRef.current) {
      setActive(frutasCat)
    }
  }, [isInternalWholesale, frutasCat])

  const [notified, setNotified] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    setCurrentPage(1)
  }, [active])

  // Enrich dummy/placeholder products ("Premium Product 30", etc.) with reference showcase visuals
  // while preserving their real backend id & slug so navigation and Add to Cart work seamlessly.
  const sourceProducts = useMemo(() => {
    const baseList = Array.isArray(products) && products.length > 0 ? products : []
    if (baseList.length === 0) {
      return SHOWCASE_TEMPLATES.map((tpl, idx) => ({
        id: `showcase-${idx + 1}`,
        slug: tpl.name.toLowerCase().replace(/\s+/g, '-'),
        inStock: true,
        ...tpl,
      }))
    }

    const enriched = baseList.map((p, idx) => {
      const tpl = SHOWCASE_TEMPLATES[idx % SHOWCASE_TEMPLATES.length]
      const isGenericName = /^premium\s+product\s*\d*$/i.test((p.name || '').trim())
      const isPlaceholderImg = !p.image || p.image.includes('placehold.co')

      return {
        ...p,
        displayName: isGenericName ? tpl.name : p.name,
        displayPrice: isGenericName ? tpl.price : Number(p.price || tpl.price),
        unit: p.unit || tpl.unit,
        image: isPlaceholderImg ? tpl.image : p.image,
        showcaseCategory: tpl.category,
      }
    })

    if (enriched.length >= 8) return enriched
    const needed = 8 - enriched.length
    const extras = SHOWCASE_TEMPLATES.slice(0, needed).map((tpl, idx) => ({
      id: `showcase-extra-${idx + 1}`,
      slug: tpl.name.toLowerCase().replace(/\s+/g, '-'),
      inStock: true,
      displayName: tpl.name,
      displayPrice: tpl.price,
      ...tpl,
    }))
    return [...enriched, ...extras]
  }, [products])

  const filtered = useMemo(() => {
    if (active === 'All') return sourceProducts
    if (active === 'On Sale') {
      const saleItems = sourceProducts.filter((p) => p.onSale)
      return saleItems.length > 0 ? saleItems : sourceProducts.slice(0, 8)
    }

    const stripItem = CATEGORY_STRIP_ITEMS.find((item) => item.id === active)
    if (stripItem) {
      const matched = sourceProducts.filter((p) => {
        const cat = (p.category || '').toLowerCase()
        const sCat = (p.showcaseCategory || '').toLowerCase()
        const name = (p.displayName || p.name || '').toLowerCase()
        if (cat === active.toLowerCase() || sCat === active.toLowerCase()) return true
        return stripItem.keywords.some((kw) => cat.includes(kw) || name.includes(kw))
      })
      return matched.length > 0 ? matched : sourceProducts.slice(0, 8)
    }

    const byCat = sourceProducts.filter((p) => p.category === active)
    return byCat.length > 0 ? byCat : sourceProducts.slice(0, 8)
  }, [sourceProducts, active])

  // Show 8 product cards on the homepage
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  function handleSelectCategory(catId) {
    userManuallyChangedRef.current = true
    setActive((prev) => (prev === catId && catId !== 'All' ? 'All' : catId))
  }

  return (
    <div style={{ backgroundColor: '#F2EFE2' }}>
      {/* ── 5-Column Category Icon Bar (Compact & Sleek) ── */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 -mt-4 md:-mt-5 relative z-20 pb-1.5 md:pb-2">
        <div
          className="grid grid-cols-5 rounded-[14px] py-2 sm:py-2.5 px-1 sm:px-3"
          style={{
            backgroundColor: '#EAE5D3',
            border: '1px solid #DAD4BE',
            boxShadow: '0 4px 14px rgba(22, 47, 27, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
          }}
        >
          {CATEGORY_STRIP_ITEMS.map((item, idx) => {
            const isSelected = active === item.id
            const isLast = idx === CATEGORY_STRIP_ITEMS.length - 1
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectCategory(item.id)}
                className="relative flex flex-col items-center justify-center gap-1 py-0.5 px-1 sm:px-2 transition-all duration-200 cursor-pointer bg-transparent border-0 group"
                style={{
                  borderRight: isLast ? 'none' : '1px solid #C8C2AE',
                }}
              >
                {/* Compact Circular Icon Medallion */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-sm [&_svg]:w-[20px] [&_svg]:h-[20px]"
                  style={{
                    backgroundColor: isSelected ? '#17361E' : '#F6F4EA',
                    color: isSelected ? '#FFFFFF' : '#1B3B22',
                    border: isSelected ? '1.5px solid #17361E' : '1px solid #D5CFB8',
                    boxShadow: isSelected
                      ? '0 3px 8px rgba(23, 54, 30, 0.2)'
                      : '0 1px 4px rgba(22, 47, 27, 0.05)',
                  }}
                >
                  {item.icon}
                </div>

                {/* Category Label */}
                <span
                  className="transition-colors duration-200 group-hover:text-[#17361E]"
                  style={{
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? '#17361E' : '#1E2F20',
                    lineHeight: 1.15,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Special Offers Slot (Middle Section) ─────────────────────────── */}
      {offersSlot}

      {/* ── Popular Products / Seasonal Favorites (8 Cards) ──────────────── */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-7 md:pt-9 pb-10 md:pb-12">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-1">
          <span
            className="uppercase font-semibold tracking-[0.15em]"
            style={{ fontSize: '11px', color: '#4E5F50' }}
          >
            POPULAR PRODUCTS
          </span>
          <span className="h-[1px] w-10" style={{ backgroundColor: '#A5A391' }} />
        </div>

        {/* Heading + Category Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
          <h2
            style={{
              fontFamily: 'var(--font-newsreader), "Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.55rem, 2.4vw, 2.0rem)',
              fontWeight: 700,
              color: '#162F1B',
              lineHeight: 1.15,
            }}
          >
            Seasonal Favorites
          </h2>

          <div className="flex items-center justify-between md:justify-end gap-2.5 flex-wrap">
            {['All', 'Fruits', 'Vegetables', 'Dairy', 'Organic', 'Others'].map((cat) => {
              const isActive = active === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    userManuallyChangedRef.current = true
                    setActive(cat)
                  }}
                  className="shrink-0 rounded-full transition-all duration-200 cursor-pointer"
                  style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    padding: '5px 14px',
                    border: isActive ? '1px solid #17361E' : '1px solid #D3CEBA',
                    backgroundColor: isActive ? '#17361E' : '#EAE5D3',
                    color: isActive ? '#FFFFFF' : '#2C3B2E',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat}
                </button>
              )
            })}

            <Link
              href={
                isInternalWholesale && frutasCat
                  ? `/shop?category=${encodeURIComponent(frutasCat)}`
                  : '/shop'
              }
              className="group inline-flex items-center gap-1.5 no-underline shrink-0 ml-1 transition-all duration-300 ease-out hover:text-[#17361E] hover:translate-x-0.5"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#3B4E3E',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 8 Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
          {paginatedProducts.map((p, idx) => (
            <ProductCard
              key={p.id}
              product={p}
              index={idx}
              notified={!!notified[p.id]}
              onNotify={() => setNotified((n) => ({ ...n, [p.id]: true }))}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
