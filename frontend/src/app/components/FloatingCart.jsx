'use client'
import { useCart } from '@/app/context/CartContext'
import { usePathname } from 'next/navigation'

export default function FloatingCart() {
  const { totalItems, setSidebarOpen } = useCart()
  const pathname = usePathname()

  if (pathname?.startsWith('/dashboard')) return null

  return (
    <button
      onClick={() => setSidebarOpen(true)}
      style={{
        position: 'fixed',
        right: '0px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 9990,
        background: '#00694C',
        color: 'white',
        border: 'none',
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
        padding: '12px 14px',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
    >
      <div style={{ position: 'relative' }}>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        {totalItems > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-10px',
            background: '#FF3B30',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            lineHeight: 1,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginTop: '2px' }}>CART</span>
    </button>
  )
}
