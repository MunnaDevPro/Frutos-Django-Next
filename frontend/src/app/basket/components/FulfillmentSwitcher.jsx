

'use client'
// src/app/basket/components/FulfillmentSwitcher.jsx

import { useState, useEffect } from 'react'
import { isStoreOpen } from '@/lib/stores-api'
import { useCart } from '@/app/context/CartContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

const MODES = [
  { id: 'delivery',   label: 'Home Delivery' },
  { id: 'collect',  label: 'Store Pickup' }
]

// ── Skeleton ───────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div
      className="mt-4 p-4 rounded-xl animate-pulse"
      style={{ background: '#f5f9f5', border: '1px solid #d4ede5', minHeight: 76 }}
    />
  )
}

// ── Inline error ───────────────────────────────────────────────────────────────

function InlineError({ message }) {
  return (
    <div
      className="mt-4 p-3 rounded-xl text-xs flex items-center gap-2"
      style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c' }}
    >
      <span className="material-symbols-outlined text-[16px]">error</span>
      {message}
    </div>
  )
}

// ── Delivery panel ─────────────────────────────────────────────────────────────

function DeliveryPanel({ data, error }) {
  if (error) return <InlineError message={error} />

  const isFree    = !data || !data.is_active || data.charge_type === 'free'
  const fee       = isFree ? 0 : Number(data.flat_fee)
  const isThresh  = data?.charge_type === 'threshold'
  const threshold = isThresh ? Number(data.free_threshold) : null

  return (
    <div
      className="mt-4 p-4 rounded-xl flex items-start gap-3"
      style={{ background: '#f5f9f5', border: '1px solid #d4ede5' }}
    >
      <span
        className="material-symbols-outlined mt-0.5 flex-shrink-0"
        style={{ color: '#00694c', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
      >
        local_shipping
      </span>
      <div>
        <p className="font-semibold text-sm" style={{ color: '#151e13' }}>
          Home delivery
        </p>
        {isFree || fee === 0 ? (
          <p className="text-xs mt-1 font-medium" style={{ color: '#00694c' }}>
            Free delivery
          </p>
        ) : (
          <p className="text-xs mt-1 font-medium" style={{ color: '#00694c' }}>
            Delivery charge: €{fee.toFixed(2)}
            {isThresh && threshold && (
              <span style={{ color: '#6d7a73' }}>
                {' '}(free over €{threshold.toFixed(2)})
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Collect panel ──────────────────────────────────────────────────────────────

function CollectPanel({ data, error }) {
  if (error) return <InlineError message={error} />

  const distanceText = data?.distance_km != null
    ? `${data.distance_km} km away`
    : null

  const readyMins  = data?.collect_ready_minutes ?? 120
  const readyLabel = readyMins >= 60
    ? `≈ ${readyMins / 60} hour${readyMins / 60 !== 1 ? 's' : ''}`
    : `≈ ${readyMins} min`

  const isOpen = data ? isStoreOpen(data) : false

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden"
      style={{ border: '1px solid #d4ede5' }}
    >
      {/* Store header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: '#f5f9f5', borderBottom: '1px solid #d4ede5' }}
      >
        <span
          className="material-symbols-outlined flex-shrink-0"
          style={{ color: '#00694c', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
        >
          store
        </span>

        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: '#151e13' }}>
            {data ? `${data.name} — ${data.address}` : '—'}
          </p>
          <p className="text-xs" style={{ color: '#6d7a73' }}>
            {data ? data.city : ''}
            {distanceText ? ` · ${distanceText}` : ''}
          </p>
        </div>

        {data && (
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={
              isOpen
                ? { background: '#d4ede5', color: '#095041' }
                : { background: '#fde8e8', color: '#9b1c1c' }
            }
          >
            {isOpen ? 'OPEN' : 'CLOSED'}
          </span>
        )}
      </div>

      {/* Hours — uses the single `hours` display string from stores.Store */}
      {data?.hours && (

        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid #d4ede5' }}
        >
          <span
            className="material-symbols-outlined text-[16px] flex-shrink-0"
            style={{ color: '#6d7a73' }}
          >
            schedule
          </span>
          <span className="text-xs" style={{ color: '#6d7a73' }}>
            Opening hours:{' '}
            <span className="font-medium" style={{ color: '#151e13' }}>
              {data.hours}
            </span>
          </span>
          {data.map_link && (
            <a
              href={data.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[11px] font-semibold flex items-center gap-1 flex-shrink-0"
              style={{ color: '#00694c' }}
            >
              <span className="material-symbols-outlined text-[14px]">map</span>
              Directions
            </a>
          )}
        </div>
      )}

      {/* Ready-in banner */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: '#edf7f2' }}
      >
        <span
          className="material-symbols-outlined text-[18px] flex-shrink-0"
          style={{ color: '#00694c' }}
        >
          inventory_2
        </span>
        <p className="text-xs" style={{ color: '#3d4943' }}>
          Your order will be ready for collection in{' '}
          <span className="font-bold" style={{ color: '#00694c' }}>{readyLabel}</span>.
          {data?.sms_notification && ' We\'ll send you an SMS when it\'s ready.'}
        </p>
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

// ── Main export ────────────────────────────────────────────────────────────────

export default function FulfillmentSwitcher({
  fulfillment,
  setFulfillment,
  initialDelivery = null,
}) {
  const deliveryError = !initialDelivery ? 'Could not load delivery info.' : null
  
  const { items, selectedStoreId, setSelectedStoreId } = useCart()
  const [eligibleStores, setEligibleStores] = useState([])
  const [loadingStores, setLoadingStores] = useState(false)
  const [storeError, setStoreError] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  useEffect(() => {
    if (items.length === 0) return
    
    const fetchEligibleStores = async () => {
      setLoadingStores(true)
      try {
        const payload = items.map(item => ({
          product_id: item.id || item.product,
          quantity: item.qty
        }))
        
        const res = await fetch(`${API_BASE}/fulfillment/stores/eligible/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: payload })
        })
        
        if (!res.ok) throw new Error('Failed to fetch stores')
        const data = await res.json()
        setEligibleStores(data)
        
        // Auto-select first store if none selected or current is invalid
        if (data.length > 0) {
           if (!selectedStoreId || !data.find(s => s.id === selectedStoreId)) {
               setSelectedStoreId(data[0].id)
           }
        } else {
           setSelectedStoreId(null)
        }
      } catch (err) {
        setStoreError(err.message)
      } finally {
        setLoadingStores(false)
      }
    }
    
    fetchEligibleStores()
  }, [items])
  
  const selectedStore = eligibleStores.find(s => s.id === selectedStoreId) || eligibleStores[0]

  return (
    <div className="mb-8 md:mb-10">
      {/* Pills */}
      <div className="inline-flex p-1 rounded-xl" style={{ background: '#f0f4f0' }}>
        {MODES.map(mode => {
          const active = fulfillment === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => setFulfillment(mode.id)}
              className="px-4 md:px-6 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: active ? '#ffffff' : 'transparent',
                color:      active ? '#00694c' : '#3d4943',
                boxShadow:  active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {mode.label}
            </button>
          )
        })}
      </div>

      {fulfillment === 'delivery' ? (
        <DeliveryPanel data={initialDelivery} error={deliveryError} />
      ) : (
        <div className="space-y-4">
          <div className="mt-4 p-4 rounded-xl" style={{ background: '#f5f9f5', border: '1px solid #d4ede5' }}>
             <label className="block text-sm font-semibold mb-2" style={{ color: '#151e13' }}>
               Select Fulfillment Store
             </label>
             {loadingStores ? (
               <div className="animate-pulse h-12 bg-white rounded-lg border border-slate-200 w-full shadow-sm"></div>
             ) : eligibleStores.length > 0 ? (
               <div className="relative" tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDropdownOpen(false) }}>
                 {/* Custom Select Button */}
                 <button 
                   type="button"
                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                   className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-[#00694c]/40 focus:outline-none focus:ring-2 focus:ring-[#00694c]/20 focus:border-[#00694c] transition-all shadow-sm cursor-pointer group"
                 >
                   <div className="flex flex-col text-left">
                     {selectedStore ? (
                       <>
                         <span className="text-[14px] font-bold text-slate-800">{selectedStore.name}</span>
                         <span className="text-[12px] text-slate-500 mt-0.5">{selectedStore.city} • <span className={isStoreOpen(selectedStore) ? "text-[#00694c] font-semibold" : "text-red-500 font-semibold"}>{isStoreOpen(selectedStore) ? 'OPEN' : 'CLOSED'}</span></span>
                       </>
                     ) : (
                       <span className="text-[14px] text-slate-500">Select a store...</span>
                     )}
                   </div>
                   <span className={`material-symbols-outlined text-slate-400 group-hover:text-[#00694c] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                     expand_more
                   </span>
                 </button>
                 
                 {/* Dropdown Menu */}
                 {isDropdownOpen && (
                   <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2 duration-200">
                     <div className="py-1">
                       {eligibleStores.map(store => {
                         const open = isStoreOpen(store)
                         const isSelected = store.id === selectedStoreId
                         return (
                           <button
                             key={store.id}
                             type="button"
                             onClick={() => {
                               setSelectedStoreId(store.id)
                               setIsDropdownOpen(false)
                             }}
                             className={`w-full flex flex-col text-left px-4 py-3 hover:bg-[#f5f9f5] transition-colors ${isSelected ? 'bg-[#edf7f2]' : ''}`}
                           >
                             <div className="flex items-center justify-between w-full">
                               <span className={`text-[14px] font-bold ${isSelected ? 'text-[#00694c]' : 'text-slate-800'}`}>
                                 {store.name}
                               </span>
                               {isSelected && (
                                 <span className="material-symbols-outlined text-[#00694c] text-[18px]">check</span>
                               )}
                             </div>
                             <span className="text-[12px] text-slate-500 mt-0.5">
                               {store.city} • <span className={open ? "text-[#00694c] font-semibold" : "text-red-500 font-semibold"}>{open ? 'OPEN' : 'CLOSED'}</span>
                             </span>
                           </button>
                         )
                       })}
                     </div>
                   </div>
                 )}
               </div>
             ) : (
               <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                 <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                 <p className="text-[13px] font-medium text-red-600">No stores have all items in stock.</p>
               </div>
             )}
          </div>
          
          {selectedStore && (
            <CollectPanel data={selectedStore} error={storeError} />
          )}
        </div>
      )}
    </div>
  )
}