'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, X, Upload, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

const CATEGORY_CHOICES = [
  { value: 'GENERAL', label: 'General Inquiry' },
  { value: 'TECHNICAL', label: 'Technical Issue' },
  { value: 'PAYMENT', label: 'Payment Problem' },
  { value: 'ACCOUNT', label: 'Account Issue' },
  { value: 'ORDER', label: 'Order Inquiry' },
  { value: 'PRODUCT', label: 'Product Question' },
]

const PRIORITY_CHOICES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

export default function SupportTicketsTab({ authFetch }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [priority, setPriority] = useState('MEDIUM')
  const [description, setDescription] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  
  const fileInputRef = useRef(null)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await authFetch(`${API_BASE}/auth/tickets/`)
      if (!res.ok) throw new Error('Failed to fetch tickets')
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : (data.results || []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) {
      const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024)
      if (validFiles.length < files.length) {
        alert("Some images were discarded because they exceed the 5MB limit.")
      }
      
      const newPreviews = validFiles.map(f => URL.createObjectURL(f))
      setImageFiles(prev => [...prev, ...validFiles])
      setImagePreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    // Note: We don't clear the input value so user can re-upload if they want
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) {
      alert("Subject and Description are required.")
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('subject', subject)
      formData.append('category', category)
      formData.append('priority', priority)
      formData.append('description', description)
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formData.append('images', file)
        })
      }

      const res = await authFetch(`${API_BASE}/auth/tickets/`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Failed to submit ticket')
      }

      // Reset form
      setSubject('')
      setCategory('GENERAL')
      setPriority('MEDIUM')
      setDescription('')
      setImageFiles([])
      setImagePreviews([])
      setShowForm(false)
      
      // Refresh list
      fetchTickets()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'OPEN': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-600" />
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'CLOSED': return <CheckCircle2 className="w-4 h-4 text-slate-600" />
      default: return <AlertCircle className="w-4 h-4 text-slate-600" />
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-700'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700'
      case 'RESOLVED': return 'bg-green-100 text-green-700'
      case 'CLOSED': return 'bg-slate-100 text-slate-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  if (loading && tickets.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00694C]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-500 mt-1">Submit issues and track your support requests.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00694C] text-white text-sm font-medium rounded-lg hover:bg-[#00523b] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        )}
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Create New Ticket</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief summary of your issue..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00694C] focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00694C] focus:border-transparent cursor-pointer"
                >
                  {CATEGORY_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00694C] focus:border-transparent cursor-pointer"
                >
                  {PRIORITY_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please describe your issue in detail..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00694C] focus:border-transparent resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Screenshot / Images (Optional)</label>
              <div className="flex flex-wrap gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative inline-block">
                    <img src={preview} alt="Preview" className="h-32 w-auto object-contain border border-gray-200 rounded-lg bg-white" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload className="w-6 h-6 mb-2 text-gray-400" />
                <span className="text-sm">Click to upload images</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
              </div>
              
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex justify-end pt-2 gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#00694C] text-white text-sm font-medium rounded-lg hover:bg-[#00523b] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {!showForm && tickets.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm">If you need help with an order, your account, or a technical issue, open a support ticket.</p>
        </div>
      )}

      {!showForm && tickets.length > 0 && (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#00694C]/30 transition-colors">
              <div className="p-5">
                <div className="flex flex-wrap gap-2 justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-400">#{ticket.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {ticket.category}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h4 className="text-base font-semibold text-gray-900 mb-2">{ticket.subject}</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {ticket.description}
                </p>

                {ticket.images && ticket.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2 tracking-wider">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {ticket.images.map(imgObj => (
                        <a key={imgObj.id} href={imgObj.image} target="_blank" rel="noopener noreferrer" className="relative group block overflow-hidden rounded-lg border border-gray-200 shrink-0">
                          <img src={imgObj.image} alt="Ticket attachment" className="h-20 w-auto object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-xs text-white font-medium">View Full</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {ticket.admin_response && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-[#00694C]/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px] text-[#00694C]">support_agent</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Admin Response</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50/50 border border-blue-100/50 p-3 rounded-lg">
                      {ticket.admin_response}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
