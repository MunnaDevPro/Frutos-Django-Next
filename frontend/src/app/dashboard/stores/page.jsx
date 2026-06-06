'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Store, Plus, Search, Edit2, Trash2, X, Check,
  MapPin, Phone, Clock, Image as ImageIcon, Tag,
  ShoppingBasket, ToggleLeft, ToggleRight, ChevronDown,
  ChevronUp, Package, Loader2, AlertCircle, Eye, EyeOff,
  Star, Leaf, Truck, ShoppingCart, ArrowUpDown, GripVertical,
} from 'lucide-react'
import { adminFetch } from '@/app/dashboard/_lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURE_OPTIONS = [
  { value: 'leftoverPack', label: 'Leftover Pack', icon: Package },
  { value: 'organic',      label: 'Organic',       icon: Leaf    },
  { value: 'delivery',     label: 'Delivery',       icon: Truck   },
  { value: 'pickup',       label: 'Click & Collect',icon: ShoppingCart },
]

const AVAILABILITY_ICONS = [
  'apple', 'leaf', 'wheat', 'milk', 'wine', 'croissant',
  'shopping-basket', 'carrot', 'egg', 'fish', 'beef', 'cherry',
]

const EMPTY_STORE = {
  name: '', short_name: '', address: '', city: '', full_address: '',
  phone: '', open_time: '08:00', close_time: '21:00',
  map_link: '', provenance: '', is_active: true, order: 0,
  features: [], availability: [], leftover_packs: [],
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-400">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" /> Inactive
    </span>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>}
      <input
        className={`bg-zinc-800 border ${error ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

function ImageUpload({ label, value, onChange, preview }) {
  const ref = useRef()
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>}
      <div
        onClick={() => ref.current?.click()}
        className="relative border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 rounded-xl overflow-hidden cursor-pointer transition-all group"
        style={{ aspectRatio: '16/7' }}
      >
        {(preview || value) ? (
          <img
            src={value instanceof File ? URL.createObjectURL(value) : preview}
            className="w-full h-full object-cover"
            alt="preview"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <ImageIcon size={24} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
            <p className="text-xs text-zinc-500">Click to upload image</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <p className="text-xs text-white font-semibold">Change Image</p>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => onChange(e.target.files[0])} />
    </div>
  )
}

// ─── Features Picker ──────────────────────────────────────────────────────────

function FeaturesPicker({ selected, onChange }) {
  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(f => f !== val) : [...selected, val])
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {FEATURE_OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = selected.includes(value)
        return (
          <button
            key={value} type="button" onClick={() => toggle(value)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all
              ${active
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
          >
            <Icon size={15} />
            {label}
            {active && <Check size={13} className="ml-auto" />}
          </button>
        )
      })}
    </div>
  )
}

// ─── Availability Manager ─────────────────────────────────────────────────────

function AvailabilityManager({ items, onChange }) {
  const [cat, setCat] = useState('')
  const [icon, setIcon] = useState('shopping-basket')

  const add = () => {
    const trimmed = cat.trim()
    if (!trimmed || items.find(i => i.category === trimmed)) return
    onChange([...items, { category: trimmed, icon }])
    setCat('')
    setIcon('shopping-basket')
  }

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={cat}
          onChange={e => setCat(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="e.g. Fruits, Bread, Veg…"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
        />
        <select
          value={icon}
          onChange={e => setIcon(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          {AVAILABILITY_ICONS.map(ic => (
            <option key={ic} value={ic}>{ic}</option>
          ))}
        </select>
        <button
          type="button" onClick={add}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300">
              <ShoppingBasket size={11} className="text-emerald-400" />
              {item.category}
              <span className="text-zinc-500 ml-0.5">{item.icon}</span>
              <button type="button" onClick={() => remove(i)} className="text-zinc-500 hover:text-red-400 ml-1">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Leftover Packs Manager ───────────────────────────────────────────────────

function LeftoverPacksManager({ packs, onChange }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', image: null, imagePreview: '' })

  const addPack = () => {
    if (!form.name || !form.price) return
    onChange([...packs, { ...form, id: Date.now(), isNew: true }])
    setForm({ name: '', description: '', price: '', image: null, imagePreview: '' })
    setShowAdd(false)
  }

  const removePack = (idx) => onChange(packs.filter((_, i) => i !== idx))

  return (
    <div className="space-y-3">
      {packs.map((pack, i) => (
        <div key={pack.id || i} className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
          {(pack.imagePreview || pack.image) && (
            <img
              src={pack.image instanceof File ? URL.createObjectURL(pack.image) : (pack.imagePreview || pack.image)}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              alt={pack.name}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{pack.name}</p>
            <p className="text-xs text-zinc-500 truncate">{pack.description}</p>
          </div>
          <span className="text-sm font-bold text-emerald-400">€{pack.price}</span>
          <button type="button" onClick={() => removePack(i)} className="text-zinc-500 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {showAdd ? (
        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl space-y-3">
          <Input label="Pack Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Veggie Rescue Box" />
          <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
          <Input label="Price (€)" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="4.99" />
          <ImageUpload
            label="Pack Image"
            value={form.image}
            preview={form.imagePreview}
            onChange={file => setForm(f => ({ ...f, image: file, imagePreview: URL.createObjectURL(file) }))}
          />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={addPack}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">
              Add Pack
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-zinc-700 hover:border-emerald-500/50 rounded-lg text-sm text-zinc-400 hover:text-emerald-400 transition-all">
          <Plus size={14} /> Add Leftover Pack
        </button>
      )}
    </div>
  )
}

// ─── Store Form Modal ─────────────────────────────────────────────────────────

function StoreFormModal({ store, onClose, onSave }) {
  const isEdit = !!store?.id
  const [form, setForm] = useState({
    ...EMPTY_STORE,
    ...(store || {}),
    // Explicit overrides to handle camelCase/snake_case and integer booleans from backend
    features: store?.features || [],
    availability: store?.availability || [],
    leftover_packs: store?.leftover_packs || [],
    open_time: store?.openTime || store?.open_time || '08:00',
    close_time: store?.closeTime || store?.close_time || '21:00',
    map_link: store?.mapLink || store?.map_link || '',
    short_name: store?.shortName || store?.short_name || '',
    full_address: store?.fullAddress || store?.full_address || '',
    // Force boolean — backend may send 0/1 or "true"/"false"
    is_active: store
      ? Boolean(store.is_active === true || store.is_active === 1 || store.is_active === 'true')
      : true,
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [section, setSection] = useState('basic')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // ── 1. Save main store (multipart for image upload) ──
      const fd = new FormData()
      const fields = ['name', 'short_name', 'address', 'city', 'full_address',
        'phone', 'open_time', 'close_time', 'map_link', 'provenance', 'order']
      fields.forEach(k => fd.append(k, form[k] ?? ''))
      fd.append('is_active', form.is_active ? 'true' : 'false')
      if (image) fd.append('image', image)

      const path = isEdit ? `/api/fulfillment/stores/${store.id}/` : '/api/fulfillment/stores/admin/'
      const method = isEdit ? 'PATCH' : 'POST'

      // adminFetch handles auth token automatically from localStorage
      const saved = await adminFetch(path, { method, body: fd })
      console.log('Store saved:', saved)

      // ── 2. Save features ──
      if (saved?.id) {
        await adminFetch(`/api/fulfillment/stores/${saved.id}/features/`, {
          method: 'PUT',
          body: { features: form.features },
        }).catch(err => console.warn('features save failed:', err.message))

        await adminFetch(`/api/fulfillment/stores/${saved.id}/availability/`, {
          method: 'PUT',
          body: { availability: form.availability },
        }).catch(err => console.warn('availability save failed:', err.message))
      }

      // ── 3. Bust Next.js cache so /stores page updates instantly ──
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: 'stores', secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET }),
      }).catch(() => {})

      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'basic',    label: 'Basic Info',  icon: Store    },
    { id: 'hours',    label: 'Hours & Map', icon: Clock    },
    { id: 'features', label: 'Features',    icon: Tag      },
    { id: 'packs',    label: 'Leftover Packs', icon: Package },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Store size={17} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white">{isEdit ? 'Edit Store' : 'Add New Store'}</p>
              <p className="text-xs text-zinc-500">{isEdit ? store.name : 'Fill in the store details below'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 flex-shrink-0 px-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setSection(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all
                ${section === id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {error && (
              <div className="flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {section === 'basic' && (
              <>
                <ImageUpload
                  label="Store Banner Image"
                  value={image}
                  preview={store?.image}
                  onChange={setImage}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Store Name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="El-Arbol Grafton Street" required />
                  <Input label="Short Name" value={form.short_name} onChange={e => set('short_name', e.target.value)} placeholder="Grafton St" required />
                </div>
                <Input label="Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="15 Grafton Street" required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Dublin" required />
                  <Input label="Full Address" value={form.full_address} onChange={e => set('full_address', e.target.value)} placeholder="15 Grafton St, Dublin 2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+353 1 234 5678" />
                  <Input label="Provenance" value={form.provenance} onChange={e => set('provenance', e.target.value)} placeholder="from Almería (optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Display Order" type="number" value={form.order} onChange={e => set('order', e.target.value)} />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</label>
                    <button
                      type="button"
                      onClick={() => set('is_active', !form.is_active)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                        ${form.is_active
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                    >
                      {form.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {form.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {section === 'hours' && (
              <>
                <SectionHeader icon={Clock} title="Opening Hours" subtitle="Set the store open and close times" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Open Time" type="time" value={form.open_time} onChange={e => set('open_time', e.target.value)} />
                  <Input label="Close Time" type="time" value={form.close_time} onChange={e => set('close_time', e.target.value)} />
                </div>
                {form.open_time && form.close_time && (
                  <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
                    <Clock size={14} className="text-emerald-400" />
                    <p className="text-sm text-zinc-300">
                      Hours: <span className="text-white font-semibold">
                        {form.open_time} — {form.close_time}
                      </span>
                    </p>
                  </div>
                )}
                <div className="mt-2">
                  <SectionHeader icon={MapPin} title="Google Maps" subtitle="Paste a Google Maps URL — lat/lng is extracted automatically" />
                  <Input
                    label="Map Link"
                    value={form.map_link}
                    onChange={e => set('map_link', e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                  {(form.lat || store?.lat) && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Saved coordinates: {store?.lat}, {store?.lng}
                    </p>
                  )}
                </div>
              </>
            )}

            {section === 'features' && (
              <>
                <div>
                  <SectionHeader icon={Tag} title="Store Features" subtitle="Select what this store offers" />
                  <FeaturesPicker selected={form.features} onChange={val => set('features', val)} />
                </div>
                <div className="border-t border-zinc-800 pt-5">
                  <SectionHeader icon={ShoppingBasket} title="Product Availability" subtitle="Add categories available at this store" />
                  <AvailabilityManager items={form.availability} onChange={val => set('availability', val)} />
                </div>
              </>
            )}

            {section === 'packs' && (
              <>
                <SectionHeader icon={Package} title="Leftover Packs" subtitle="Surprise packs available at this store" />
                <LeftoverPacksManager packs={form.leftover_packs} onChange={val => set('leftover_packs', val)} />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 flex-shrink-0">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {isEdit ? 'Save Changes' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ store, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h3 className="font-bold text-white text-lg mb-1">Delete Store</h3>
        <p className="text-sm text-zinc-400 mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">{store.name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Store Row ────────────────────────────────────────────────────────────────

function StoreRow({ store, onEdit, onDelete, onToggle }) {
  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {store.image ? (
            <img src={store.image} alt={store.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-zinc-700" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
              <Store size={16} className="text-zinc-600" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">{store.name}</p>
            <p className="text-xs text-zinc-500">{store.shortName || store.short_name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <MapPin size={11} className="text-zinc-600" />
          {store.city}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Clock size={11} className="text-zinc-600" />
          {store.hours || `${store.openTime || store.open_time} — ${store.closeTime || store.close_time}`}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {(store.features || []).slice(0, 3).map(f => (
            <span key={f} className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-400 capitalize">
              {f}
            </span>
          ))}
          {(store.features || []).length > 3 && (
            <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-500">
              +{store.features.length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge active={store.is_active} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onToggle(store)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
            title={store.is_active ? 'Deactivate' : 'Activate'}>
            {store.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button onClick={() => onEdit(store)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
            title="Edit">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(store)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
            title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StoresPage() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const [editStore, setEditStore] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteStore, setDeleteStore] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminFetch('/api/fulfillment/stores/admin/')
      setStores(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      console.error('Load stores error:', e)
      setError(e.message || 'Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = stores.filter(s => {
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterActive === 'all' ||
      (filterActive === 'active' && s.is_active) ||
      (filterActive === 'inactive' && !s.is_active)
    return matchSearch && matchStatus
  })

  const handleEdit  = (store) => { setEditStore(store); setShowForm(true) }
  const handleAdd   = () => { setEditStore(null); setShowForm(true) }
  const handleClose = () => { setShowForm(false); setEditStore(null) }
  const handleSaved = () => { handleClose(); load() }

  const handleToggle = async (store) => {
    // Optimistic update — flip immediately in UI
    setStores(prev => prev.map(s =>
      s.id === store.id ? { ...s, is_active: !s.is_active } : s
    ))
    try {
      const fd = new FormData()
      fd.append('is_active', store.is_active ? 'false' : 'true')
      await adminFetch(`/api/fulfillment/stores/${store.id}/`, { method: 'PATCH', body: fd })
      load() // sync with server
    } catch (e) {
      console.error('Toggle error:', e)
      // Revert on failure
      setStores(prev => prev.map(s =>
        s.id === store.id ? { ...s, is_active: store.is_active } : s
      ))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminFetch(`/api/fulfillment/stores/${deleteStore.id}/`, { method: 'DELETE' })
      setDeleteStore(null)
      load()
    } catch (e) { console.error('Delete error:', e) }
    finally { setDeleting(false) }
  }

  const activeCount   = stores.filter(s => s.is_active).length
  const inactiveCount = stores.filter(s => !s.is_active).length

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">

      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Stores</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage physical store locations, hours and features</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-900 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Store
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Stores', value: stores.length,  color: 'text-white' },
          { label: 'Active',       value: activeCount,    color: 'text-emerald-400' },
          { label: 'Inactive',     value: inactiveCount,  color: 'text-zinc-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stores…"
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {['all', 'active', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize
                ${filterActive === f ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
            <Loader2 size={18} className="animate-spin" /> Loading stores…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-sm font-semibold text-red-400">{error}</p>
            <button onClick={load} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-xl">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <Store size={24} className="text-zinc-600" />
            </div>
            <p className="text-sm font-semibold text-zinc-400">No stores found</p>
            <p className="text-xs text-zinc-600">
              {search ? 'Try a different search term' : 'Add your first store to get started'}
            </p>
            {!search && (
              <button onClick={handleAdd}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors">
                Add Store
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Store', 'City', 'Hours', 'Features', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(store => (
                <StoreRow
                  key={store.id}
                  store={store}
                  onEdit={handleEdit}
                  onDelete={setDeleteStore}
                  onToggle={handleToggle}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <StoreFormModal
          store={editStore}
          onClose={handleClose}
          onSave={handleSaved}
        />
      )}
      {deleteStore && (
        <DeleteConfirm
          store={deleteStore}
          onClose={() => setDeleteStore(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}