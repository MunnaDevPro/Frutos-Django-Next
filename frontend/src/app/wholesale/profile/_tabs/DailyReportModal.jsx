import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-hot-toast'
import { createWholesaleDailyReport } from '@/lib/api'

export default function DailyReportModal({ onClose, accessToken, onReportCreated }) {
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    cash: '',
    bank: '',
    expenses: '',
    store: '',
    purchase: '',
    date: new Date().toISOString().split('T')[0],
    purchase_note: ''
  })

  useEffect(() => setMounted(true), [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.cash || !formData.bank || !formData.date) {
      toast.error('Cash, Bank, and Date are required.')
      return
    }

    setSubmitting(true)
    try {
      const newReport = await createWholesaleDailyReport(accessToken, formData)
      toast.success('Daily report submitted successfully!')
      onReportCreated(newReport)
      onClose()
    } catch (err) {
      toast.error(err.detail || err.error || 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Submit Daily Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Money (cash) <span className="text-red-500">*</span></label>
              <input 
                type="number" step="0.01" name="cash" value={formData.cash} onChange={handleChange} required
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-[#16a34a] focus:border-transparent outline-none transition-all"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Total cash received in hand today</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bank <span className="text-red-500">*</span></label>
              <input 
                type="number" step="0.01" name="bank" value={formData.bank} onChange={handleChange} required
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-[#16a34a] focus:border-transparent outline-none transition-all"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Total amount received in bank/card</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Expenses</label>
              <input 
                type="number" step="0.01" name="expenses" value={formData.expenses} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-[#16a34a] focus:border-transparent outline-none transition-all"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Any daily shop expenses</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Warehouse (store)</label>
              <input 
                type="number" step="0.01" name="store" value={formData.store} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-[#16a34a] focus:border-transparent outline-none transition-all"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Stock/goods taken from warehouse</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase</label>
              <input 
                type="number" step="0.01" name="purchase" value={formData.purchase} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-[#16a34a] focus:border-transparent outline-none transition-all"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Outside purchases made today</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input 
                type="date" name="date" value={formData.date} onChange={handleChange} required
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-[#16a34a] focus:border-transparent outline-none transition-all"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Date of this report</p>
            </div>
            <div className="sm:col-span-2 mt-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Note</label>
              <textarea 
                name="purchase_note" rows="2" value={formData.purchase_note} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-[#16a34a] focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Details of what was purchased (optional)</p>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button 
              type="button" onClick={onClose}
              className="px-4 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={submitting}
              className="px-5 py-1.5 text-sm font-semibold text-white bg-[#085041] rounded hover:bg-[#064032] disabled:opacity-70 flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
