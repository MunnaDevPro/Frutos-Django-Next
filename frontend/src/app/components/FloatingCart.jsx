'use client'
import { useCart } from '@/app/context/CartContext'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function FloatingCart() {
  const { totalItems, setSidebarOpen } = useCart()
  const pathname = usePathname()
  const [isBumping, setIsBumping] = useState(false)

  // Trigger bump animation whenever totalItems changes
  useEffect(() => {
    if (totalItems === 0) return
    setIsBumping(true)
    const timer = setTimeout(() => setIsBumping(false), 400)
    return () => clearTimeout(timer)
  }, [totalItems])

  if (pathname?.startsWith('/dashboard')) return null

  return (
    <>
      <style>{`
        @keyframes cartBump {
          0%   { transform: scale(1); }
          20%  { transform: scale(1.15) rotate(-6deg); }
          40%  { transform: scale(1.15) rotate(6deg); }
          60%  { transform: scale(1.15) rotate(-3deg); }
          80%  { transform: scale(1.15) rotate(3deg); }
          100% { transform: scale(1); }
        }
        .bump-anim {
          animation: cartBump 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        .floating-cart-wrapper {
          position: fixed;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9990;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .floating-cart-wrapper:hover {
          transform: translateY(-50%) translateX(-4px) scale(1.05);
        }
      `}</style>

      <div className="floating-cart-wrapper">
        <button
          onClick={() => setSidebarOpen(true)}
          className={isBumping ? 'bump-anim' : ''}
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.05)',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            willChange: 'transform',
            position: 'relative'
          }}
        >
          <Image 
            src="/bag3d.png" 
            alt="Cart" 
            width={44} 
            height={44} 
            style={{ 
              objectFit: 'contain', 
              mixBlendMode: 'multiply',
              transform: 'translateY(2px)' // slight adjustment to center visually
            }} 
          />
          
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-4px',
            background: '#FF3B30',
            color: 'white',
            borderRadius: '50%',
            minWidth: '24px',
            height: '24px',
            padding: '0 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '900',
            lineHeight: 1,
            boxShadow: '0 4px 10px rgba(255, 59, 48, 0.4)',
            opacity: totalItems > 0 ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}>
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        </button>
      </div>
    </>
  )
}
