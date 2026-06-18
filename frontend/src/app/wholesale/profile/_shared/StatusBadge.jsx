const CONFIG = {
  // Wholesale Profile Statuses
  approved:  { label: 'Approved',     bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  pending:   { label: 'Under Review', bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  rejected:  { label: 'Not Approved', bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  suspended: { label: 'Suspended',    bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },

  // Order Statuses
  processing: { label: 'Processing', bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  shipped:    { label: 'Shipped',    bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  delivered:  { label: 'Delivered',  bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  cancelled:  { label: 'Cancelled',  bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
}

export default function StatusBadge({ status }) {
  const normalizedStatus = (status || '').toLowerCase()
  const c = CONFIG[normalizedStatus] || CONFIG.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: c.bg, color: c.color,
      borderRadius: 100, padding: '4px 12px',
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'inline-block', flexShrink: 0 }} />
      {c.label}
    </span>
  )
}