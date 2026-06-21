import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-hot-toast'
import { createWholesaleDailyReport } from '@/lib/api'
import { X, Calendar, DollarSign, CreditCard, Receipt, Store, ShoppingBag, FileText } from 'lucide-react'

export default function DailyReportModal({ onClose, accessToken, onReportCreated }) {
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const dateInputRef = useRef(null)

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

  const handleDateClick = () => {
    if (dateInputRef.current && dateInputRef.current.showPicker) {
      dateInputRef.current.showPicker();
    }
  }

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/40 z-[999] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Submit Daily Report</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Fill in the financials for today's wholesale operations.</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            
            {/* Cash */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Money (cash) <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <input 
                  type="number" step="0.01" name="cash" value={formData.cash} onChange={handleChange} required
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[11px] text-slate-500">Total cash received in hand today</p>
            </div>

            {/* Bank */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Bank <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <input 
                  type="number" step="0.01" name="bank" value={formData.bank} onChange={handleChange} required
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[11px] text-slate-500">Total amount received in bank/card</p>
            </div>

            {/* Expenses */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Expenses</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Receipt className="h-3.5 w-3.5 text-rose-500" />
                </div>
                <input 
                  type="number" step="0.01" name="expenses" value={formData.expenses} onChange={handleChange}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[11px] text-slate-500">Any daily shop expenses</p>
            </div>

            {/* Warehouse */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Warehouse (store)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Store className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <input 
                  type="number" step="0.01" name="store" value={formData.store} onChange={handleChange}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[11px] text-slate-500">Stock/goods taken from warehouse</p>
            </div>

            {/* Purchase */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Purchase</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <input 
                  type="number" step="0.01" name="purchase" value={formData.purchase} onChange={handleChange}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[11px] text-slate-500">Outside purchases made today</p>
            </div>

            {/* Professional Date Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Date <span className="text-red-500">*</span></label>
              <div 
                className="relative cursor-pointer group"
                onClick={handleDateClick}
              >
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Calendar className="h-3.5 w-3.5 text-[#00a884] group-hover:scale-110 transition-transform" />
                </div>
                <input 
                  ref={dateInputRef}
                  type="date" name="date" value={formData.date} onChange={handleChange} required
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884] outline-none transition-all shadow-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-500">Click to select report date</p>
            </div>

            {/* Purchase Note */}
            <div className="sm:col-span-2 space-y-1 mt-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Purchase Note</label>
              <div className="relative">
                <div className="absolute top-2 left-2.5 pointer-events-none">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <textarea 
                  name="purchase_note" rows="2" value={formData.purchase_note} onChange={handleChange}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884] outline-none transition-all shadow-sm resize-none placeholder:text-slate-300"
                  placeholder="Details of what was purchased (optional)..."
                ></textarea>
              </div>
            </div>

          </div>
          
          <div className="mt-5 flex justify-end gap-2 pt-4 border-t border-slate-200/60">
            <button 
              type="button" onClick={onClose}
              className="px-4 py-1.5 text-[13px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={submitting}
              className="px-5 py-1.5 text-[13px] font-bold text-white bg-[#00a884] rounded-lg hover:bg-[#009070] hover:shadow hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Submitting...
                </>
              ) : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
