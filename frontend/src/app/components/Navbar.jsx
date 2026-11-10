'use client'
// src/app/components/Navbar.jsx
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/app/context/CartContext'
import { useAuth } from '@/app/context/AuthContext'
import AuthModal from '@/app/components/AuthModal'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')

const navLinks = [
  { label: 'Home',         href: '/'          },
  { label: 'Find a Store', href: '/stores'    },
  { label: 'Our Produce',  href: '/shop', hasChevron: true },
  { label: 'About Us',     href: '/about'     },
  { label: 'Contact',      href: '/wholesale' },
]

// ── Profile Menu ─────────────────────────────────────────────────────────────
function ProfileMenu({ user, logout }) {
  const [open, setOpen] = useState(false)
  const menuRef         = useRef(null)
  const router          = useRouter()

  useEffect(() => {
    function handler(e) {
      if (!menuRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const avatarUrl   = user?.profile?.resolvedAvatar || ''
  const initials    = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase()
                      || user?.email?.[0]?.toUpperCase() || '?'
  const displayName = user?.fullName || user?.firstName || user?.email || 'My Account'

  async function handleLogout() {
    setOpen(false)
    await logout()
    router.push('/')
  }

  const menuItems = [
    { label: 'My Profile',  icon: 'person',          href: '/profile'             },
    { label: 'My Orders',   icon: 'receipt_long',    href: '/profile?tab=orders'  },
    { label: 'Saved Items', icon: 'favorite_border', href: '/profile?tab=saved'   },
    { label: 'Settings',    icon: 'settings',        href: '/profile?tab=settings'},
  ]

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full text-white font-medium transition-colors cursor-pointer border-none"
        style={{
          backgroundColor: '#2A4733',
          fontSize: '12.5px',
          padding: '6px 14px 6px 8px',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: avatarUrl ? 'transparent' : 'rgba(255,255,255,0.2)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt={displayName} width={28} height={28} style={{ objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'white', lineHeight: 1 }}>
              {initials}
            </span>
          )}
        </div>
        <span className="truncate max-w-[96px]">{displayName.split(' ')[0]}</span>
        <span>→</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '220px',
            background: '#FAF9F4',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(8,28,20,.14), 0 2px 8px rgba(0,0,0,.06)',
            border: '1px solid #DFDBC8',
            overflow: 'hidden',
            zIndex: 100,
            animation: 'profileDropIn .18s ease',
          }}
        >
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #E6E2D1' }}>
            <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#162F1B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </p>
            <p style={{ fontSize: '12px', color: '#5A685B', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <div style={{ padding: '6px 0' }}>
            {menuItems.map(({ label, icon, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 16px',
                  fontSize: '13.5px',
                  color: '#253527',
                  textDecoration: 'none',
                  transition: 'background .12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#EFECE0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4E5F50' }}>
                  {icon}
                </span>
                {label}
              </Link>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #E6E2D1', padding: '6px 0' }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13.5px',
                color: '#C84040',
                textAlign: 'left',
                transition: 'background .12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF5F5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                logout
              </span>
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar({ navbarLogoUrl = '', brandName = 'El Árbol' }) {
  const { user, isAuthenticated, logout, authFetch } = useAuth()
  const { data: session } = useSession()

  const isWholesaleUser = !!session?.user?.accessToken
  const isInternalWholesale =
    isWholesaleUser &&
    (!session?.user?.userType ||
      session?.user?.userType === 'WHOLESALER' ||
      session?.user?.user_type === 'WHOLESALER' ||
      session?.user?.userType === 'internal')

  const wholesaleName =
    session?.user?.businessName ||
    session?.user?.contactName ||
    session?.user?.name ||
    'Wholesale'
  const wholesaleInitial = wholesaleName[0].toUpperCase()

  const [open, setOpen]                         = useState(false)
  const [authOpen, setAuthOpen]                 = useState(false)
  const [authMode, setAuthMode]                 = useState('login')
  const [query, setQuery]                       = useState('')
  const [showDropdown, setShowDropdown]         = useState(false)
  const [activeIndex, setActiveIndex]           = useState(-1)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [allProducts, setAllProducts]           = useState([])
  const [unreadCount, setUnreadCount]           = useState(0)

  // Fetch products for live search autocomplete
  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')
    const mediaBase = base.replace('/api', '')

    fetch(`${base}/products/products/`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || []
        setAllProducts(
          arr.map((p) => {
            let image = p.thumbnail || p.thumbnail_url || p.image_url || p.image || null
            if (image && !image.startsWith('http')) {
              const clean = image.replace(/^\/+/, '')
              image = `${mediaBase}/${clean}`
            }
            const PLACEHOLDER = '/homepage/prod_apple.jpg'
            const originalPrice = Number(p.price || 0)
            const discountPrice = p.discount_price != null ? Number(p.discount_price) : null
            const displayPrice =
              discountPrice && discountPrice < originalPrice ? discountPrice : originalPrice
            const onSale = discountPrice != null && discountPrice < originalPrice
            const category =
              typeof p.category === 'object' && p.category !== null
                ? p.category.name
                : p.sub_category?.category?.name || p.category || ''

            return {
              ...p,
              image: image || PLACEHOLDER,
              price: displayPrice,
              oldPrice: onSale ? originalPrice : null,
              onSale,
              category,
              slug: p.slug || null,
            }
          })
        )
      })
      .catch(() => {})
  }, [])

  // Fetch unread notification count when authenticated
  useEffect(() => {
    if (!isAuthenticated && (!isWholesaleUser || isInternalWholesale)) {
      setUnreadCount(0)
      return
    }

    async function fetchCount() {
      try {
        let res
        if (isAuthenticated) {
          res = await authFetch(`${API_BASE}/auth/notifications/unread-count/`)
        } else if (isWholesaleUser && session?.user?.accessToken) {
          res = await fetch(`${API_BASE}/wholesale/notifications/unread-count/`, {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          })
        }

        if (res?.ok) {
          const data = await res.json()
          setUnreadCount(data.unread_count ?? data.unreadCount ?? 0)
        }
      } catch {
        /* ignore */
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 10_000)
    return () => clearInterval(interval)
  }, [isAuthenticated, isWholesaleUser, isInternalWholesale, session, authFetch])

  const filtered =
    query.trim().length > 0
      ? allProducts
          .filter(
            (p) =>
              p.name?.toLowerCase().includes(query.toLowerCase()) ||
              p.category?.toLowerCase().includes(query.toLowerCase()) ||
              p.origin?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 6)
      : []

  const { totalItems, setSidebarOpen } = useCart()
  const pathname = usePathname()
  const router   = useRouter()

  const inputRef       = useRef(null)
  const mobileInputRef = useRef(null)
  const dropdownRef    = useRef(null)

  const openLogin  = () => { setAuthMode('login');  setAuthOpen(true) }
  const openSignup = () => { setAuthMode('signup'); setAuthOpen(true) }

  function isActive(href) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        !dropdownRef.current?.contains(e.target) &&
        !inputRef.current?.contains(e.target) &&
        !mobileInputRef.current?.contains(e.target)
      ) {
        setShowDropdown(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setShowDropdown(false)
      setActiveIndex(-1)
    }
  }, [mobileSearchOpen])

  function handleInputChange(e) {
    setQuery(e.target.value)
    setShowDropdown(true)
    setActiveIndex(-1)
  }

  function handleKeyDown(e) {
    if (!showDropdown || !filtered.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      navigateToProduct(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setActiveIndex(-1)
      setMobileSearchOpen(false)
    }
  }

  function navigateToProduct(product) {
    setQuery('')
    setShowDropdown(false)
    setActiveIndex(-1)
    setMobileSearchOpen(false)
    const slug =
      product.slug ||
      product.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
    router.push(`/products/${slug}`)
  }

  async function handleBellClick() {
    if (isAuthenticated || isWholesaleUser) {
      setUnreadCount(0)
      try {
        if (isAuthenticated) {
          await authFetch(`${API_BASE}/auth/notifications/mark-read/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ all: true }),
          })
        } else if (isWholesaleUser && session?.user?.accessToken) {
          await fetch(`${API_BASE}/wholesale/notifications/mark-read/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.user.accessToken}`,
            },
            body: JSON.stringify({ all: true }),
          })
        }
      } catch {
        /* ignore */
      }

      if (isWholesaleUser) {
        router.push('/wholesale/profile?tab=notifications')
      } else {
        router.push('/profile?tab=notifications')
      }
    } else {
      openLogin()
    }
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-sm border-b"
        style={{
          backgroundColor: '#F5F3E7',
          borderColor: '#E2DDD0',
        }}
      >
        <nav className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between gap-4">
          {/* ── Left Brand Emblem + Title + Tagline ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="brandCircleGrad" x1="4" y1="6" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#E5E6CD" />
                    <stop offset="55%" stopColor="#BDCEA4" />
                    <stop offset="100%" stopColor="#8AA86E" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="18.5" fill="url(#brandCircleGrad)" stroke="#7E9768" strokeWidth="1.2" />
                <circle cx="20" cy="20" r="16" stroke="#F4F3E6" strokeWidth="0.9" strokeOpacity="0.7" />
                {/* Center Tall Leaf */}
                <path
                  d="M19.5 9.5C16.2 13.5 16.2 19.2 19.5 23.5C22.8 19.2 22.8 13.5 19.5 9.5Z"
                  fill="#2C522E"
                  stroke="#1C391E"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Left Leaf */}
                <path
                  d="M19.2 25.5C13.2 24.8 10.2 20.5 10.8 15.8C15.5 16.5 18.5 20.2 19.2 25.5Z"
                  fill="#3A643B"
                  stroke="#1C391E"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Right Small Sprout Leaf */}
                <path
                  d="M20.2 24.5C24.5 24.2 27.5 21.5 27.8 18C24.2 18.2 21.2 20.5 20.2 24.5Z"
                  fill="#4E7B4B"
                  stroke="#1C391E"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Stem & Veins */}
                <path
                  d="M19.5 14V31.5M19.2 25.2L14.2 19.8M20.2 24.2L24.5 20.5"
                  stroke="#1C391E"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: 'var(--font-newsreader), "Playfair Display", Georgia, serif',
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#16351D',
                  lineHeight: 1.05,
                  letterSpacing: '-0.01em',
                }}
              >
                Market Finder
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-newsreader), "Playfair Display", Georgia, serif',
                  fontSize: '10.5px',
                  fontStyle: 'italic',
                  color: '#4E5F50',
                  lineHeight: 1.2,
                }}
              >
                Fresh. Local. Together
              </span>
            </div>
          </Link>

          {/* ── Center Desktop Navigation Links ── */}
          <ul className="hidden md:flex items-center gap-5 lg:gap-7 h-full m-0 p-0 list-none">
            {navLinks.map(({ label, href, hasChevron }) => {
              const active = isActive(href)
              return (
                <li key={label} className="h-full flex items-center">
                  <Link
                    href={href}
                    className="h-full inline-flex items-center gap-1 whitespace-nowrap transition-colors"
                    style={{
                      fontSize: '13.5px',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#16351D' : '#354337',
                      borderBottom: active ? '2px solid #16351D' : '2px solid transparent',
                    }}
                  >
                    <span>{label}</span>
                    {hasChevron && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* ── Right Actions (Search, Bell, Cart, My Account Pill) ── */}
          <div className="hidden md:flex items-center gap-2.5 ml-auto">
            {/* Search Input Pill */}
            <div className="relative hidden lg:block">
              <label
                className="flex items-center gap-2 rounded-full px-3.5 py-2 w-[220px] cursor-text"
                style={{
                  backgroundColor: '#E8E4D5',
                  border: '1px solid #DCD7C4',
                }}
              >
                <svg width="14" height="14" fill="none" stroke="#5E6B5F" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search fresh produce.."
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => query.trim() && setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent outline-none w-full placeholder:text-[#667266]"
                  style={{ fontSize: '12.5px', color: '#162F1B', border: 'none' }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setShowDropdown(false)
                      inputRef.current?.focus()
                    }}
                    className="flex-shrink-0 text-[#5E6B5F] hover:text-[#162F1B] transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </label>

              {showDropdown && query.trim().length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 top-[calc(100%+8px)] w-[280px] bg-[#FAF9F4] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#DFDBC8] overflow-hidden z-50"
                >
                  {filtered.length > 0 ? (
                    <>
                      <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold tracking-widest text-[#5E6B5F] uppercase">
                        Products
                      </p>
                      <ul className="m-0 p-0 list-none">
                        {filtered.map((product, idx) => (
                          <li key={product.id}>
                            <button
                              type="button"
                              onMouseEnter={() => setActiveIndex(idx)}
                              onMouseLeave={() => setActiveIndex(-1)}
                              onClick={() => navigateToProduct(product)}
                              className="w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer border-none"
                              style={{
                                backgroundColor: activeIndex === idx ? '#EFECE0' : 'transparent',
                              }}
                            >
                              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  onError={(e) => {
                                    e.currentTarget.src = '/homepage/prod_apple.jpg'
                                  }}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-[#162F1B] truncate m-0">
                                  {highlightMatch(product.name, query)}
                                </p>
                                <p className="text-[11px] text-[#5E6B5F] m-0">{product.category}</p>
                              </div>
                              <span className="text-[12.5px] font-semibold text-[#17361E]">
                                ${product.price.toFixed(2)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-[#E6E2D1] px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            router.push(`/shop?q=${encodeURIComponent(query)}`)
                            setShowDropdown(false)
                          }}
                          className="text-[12px] text-[#17361E] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                        >
                          See all results for &quot;{query}&quot; →
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-5 text-center">
                      <p className="text-[12.5px] text-[#5E6B5F] m-0">
                        No products found for <span className="font-semibold text-[#162F1B]">&quot;{query}&quot;</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {!isInternalWholesale && (
              <button
                type="button"
                onClick={handleBellClick}
                aria-label="Notifications"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#E8E4D5] transition-colors relative cursor-pointer bg-transparent border-none"
              >
                <svg width="18" height="18" fill="none" stroke="#253527" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-[3px] bg-[#C84040] text-white rounded-full flex items-center justify-center"
                    style={{ fontSize: '9.5px', fontWeight: 700, lineHeight: 1 }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Shopping Cart"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#E8E4D5] transition-colors relative cursor-pointer bg-transparent border-none"
            >
              <svg width="18" height="18" fill="none" stroke="#253527" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M5 8h14l-1.5 11H6.5L5 8z" />
                <path d="M9 8V6a3 3 0 1 1 6 0v2" />
              </svg>
              {totalItems > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-[3px] bg-[#17361E] text-white rounded-full flex items-center justify-center"
                  style={{ fontSize: '9.5px', fontWeight: 700, lineHeight: 1 }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Auth / My Account Pill */}
            {isAuthenticated ? (
              <ProfileMenu user={user} logout={logout} />
            ) : isWholesaleUser ? (
              <Link
                href="/wholesale/profile"
                className="inline-flex items-center gap-2 rounded-full text-white font-medium no-underline"
                style={{
                  backgroundColor: '#2A4733',
                  fontSize: '12.5px',
                  padding: '7px 14px',
                }}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  {wholesaleInitial}
                </span>
                <span className="truncate max-w-[85px]">{wholesaleName.split(' ')[0]}</span>
                <span>→</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="inline-flex items-center gap-1.5 rounded-full text-white font-medium transition-colors hover:bg-[#17361E] cursor-pointer border-none"
                style={{
                  backgroundColor: '#2C4735',
                  fontSize: '12.5px',
                  padding: '8px 16px',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>My Account</span>
                <span>→</span>
              </button>
            )}
          </div>

          {/* ── Mobile Right Controls ── */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((v) => !v)
                setOpen(false)
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent border-none cursor-pointer"
              aria-label="Search"
            >
              <svg width="18" height="18" fill="none" stroke="#162F1B" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center relative bg-transparent border-none cursor-pointer"
              aria-label="Cart"
            >
              <svg width="18" height="18" fill="none" stroke="#162F1B" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M5 8h14l-1.5 11H6.5L5 8z" />
                <path d="M9 8V6a3 3 0 1 1 6 0v2" />
              </svg>
              {totalItems > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-[3px] bg-[#17361E] text-white rounded-full flex items-center justify-center"
                  style={{ fontSize: '9px', fontWeight: 700, lineHeight: 1 }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(!open)
                setMobileSearchOpen(false)
              }}
              className="w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer"
              aria-label="Menu"
            >
              <svg width="19" height="19" fill="none" stroke="#162F1B" strokeWidth="2" viewBox="0 0 24 24">
                {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="lg:hidden bg-[#F5F3E7] border-t border-[#E2DDD0] px-4 py-3">
            <div className="flex items-center gap-2 bg-[#E8E4D5] rounded-full px-4 py-2">
              <svg width="15" height="15" fill="none" stroke="#5E6B5F" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search fresh produce.."
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="bg-transparent outline-none flex-1 placeholder:text-[#667266]"
                style={{ fontSize: '13.5px', color: '#162F1B', border: 'none' }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {open && (
        <div className="fixed inset-0 top-[66px] bg-[#F2EFE2] z-40 px-6 pt-6 pb-10 flex flex-col md:hidden overflow-y-auto">
          {navLinks.map(({ label, href }) => {
            const active = isActive(href)
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-[#DFDBC8] py-3.5 flex items-center justify-between no-underline"
                style={{
                  fontFamily: 'var(--font-newsreader), "Playfair Display", Georgia, serif',
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  color: active ? '#17361E' : '#253527',
                }}
              >
                {label}
                {active && <span className="w-2 h-2 rounded-full bg-[#17361E]" />}
              </Link>
            )
          })}

          {!isAuthenticated && !isWholesaleUser && (
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  openLogin()
                }}
                className="flex-1 text-center border border-[#17361E] rounded-full bg-transparent cursor-pointer"
                style={{ fontSize: '13.5px', fontWeight: 600, color: '#17361E', padding: '10px 0' }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  openSignup()
                }}
                className="flex-1 text-center bg-[#17361E] text-white rounded-full border-none cursor-pointer"
                style={{ fontSize: '13.5px', fontWeight: 600, padding: '10px 0' }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} />
    </>
  )
}

function highlightMatch(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#D6E2CA', color: '#16351D', borderRadius: '2px', padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
