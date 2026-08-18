import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BookingStatus, BookingSummary } from '../types/booking'
import { STATUS_LABELS, STATUS_COLORS } from '../types/booking'
import { MOCK_ADMIN_BOOKINGS } from '../lib/mockData'
import { FJD, formatDateTime, formatDate, whatsappUrl, buildICal, downloadICal } from '../lib/utils'

const STATUS_ORDER: BookingStatus[] = [
  'pending_approval',
  'approved_pending_deposit',
  'confirmed',
  'rejected',
  'cancelled',
]

const STATUS_ICONS: Record<BookingStatus, string> = {
  pending_approval: '🕐',
  approved_pending_deposit: '💳',
  confirmed: '✅',
  rejected: '❌',
  cancelled: '🚫',
}

function RejectModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
        <h3 className="font-bold text-teal-900 text-lg mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Reject Booking</h3>
        <p className="text-sand-500 text-sm mb-4">Provide a reason — this will be shared with the renter via WhatsApp.</p>
        <textarea
          rows={4}
          autoFocus
          placeholder="e.g. Venue policy prohibits political events."
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full border-2 border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-sand-200 text-sand-600 font-semibold text-sm hover:border-sand-400 transition-colors">
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm disabled:opacity-40 hover:bg-red-400 transition-colors"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  )
}

function BookingCard({ booking, onAction }: {
  booking: BookingSummary
  onAction: (id: string, action: 'approve' | 'reject' | 'mark_paid' | 'confirm', reason?: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const navigate = useNavigate()

  const approveMsg = `Hello ${booking.renter_name}! 🎉 Your booking *${booking.reference_code}* for *${booking.event_title}* at ${booking.venue_name} has been APPROVED. Please pay the deposit of ${FJD(booking.deposit_amount_fjd)} to confirm your slot. Reply to this message for payment options. Thank you!`

  const depositMsg = `Hi ${booking.renter_name}, we've received and verified your deposit for *${booking.reference_code}*. Your booking for *${booking.event_title}* on ${formatDate(booking.start_time)} is now CONFIRMED. See you then! 🙏`

  const rejectionMsg = (reason: string) =>
    `Hello ${booking.renter_name}, unfortunately your booking *${booking.reference_code}* for ${booking.event_title} has been declined. Reason: ${reason}. Please contact us if you have any questions. Thank you.`

  const handleIcal = () => {
    const content = buildICal({
      uid: booking.id,
      summary: `[RENTAL] ${booking.event_title}`,
      location: `${booking.venue_name} — ${booking.space_name}`,
      start: booking.start_time,
      end: booking.end_time,
      description: `Renter: ${booking.renter_name} | Contact: ${booking.renter_phone} | Ref: ${booking.reference_code}`,
    })
    downloadICal(content, `${booking.reference_code}.ics`)
  }

  return (
    <>
      {rejectOpen && (
        <RejectModal
          onClose={() => setRejectOpen(false)}
          onConfirm={reason => {
            onAction(booking.id, 'reject', reason)
            setRejectOpen(false)
          }}
        />
      )}

      <div className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${
        booking.status === 'pending_approval' ? 'border-amber-300' :
        booking.status === 'approved_pending_deposit' ? 'border-blue-300' :
        booking.status === 'confirmed' ? 'border-emerald-300' :
        'border-sand-200'
      }`}>
        {/* Card header */}
        <div className="p-4 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
            booking.status === 'pending_approval' ? 'bg-amber-100' :
            booking.status === 'approved_pending_deposit' ? 'bg-blue-100' :
            booking.status === 'confirmed' ? 'bg-emerald-100' :
            'bg-sand-100'
          }`}>
            {STATUS_ICONS[booking.status]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <span className="font-bold text-teal-900 text-sm">{booking.event_title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLORS[booking.status]}`}>
                {STATUS_LABELS[booking.status]}
              </span>
            </div>
            <div className="text-xs text-sand-500 mt-0.5">
              {booking.reference_code} · {booking.space_name} · {booking.venue_name}
            </div>
            <div className="text-xs text-sand-600 mt-1 font-mono">
              {formatDateTime(booking.start_time)} → {new Date(booking.end_time).toLocaleTimeString('en-FJ', { hour: '2-digit', minute: '2-digit', timeZone: 'Pacific/Fiji' })}
            </div>
          </div>

          <div className="text-right flex-shrink-0 hidden sm:block">
            <div className="font-bold text-teal-900">{FJD(booking.total_amount_fjd)}</div>
            <div className="text-xs text-sand-400 font-mono">deposit {FJD(booking.deposit_amount_fjd)}</div>
          </div>
        </div>

        {/* Renter info strip */}
        <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-sand-600 border-t border-sand-100 pt-3">
          <span>👤 {booking.renter_name}</span>
          <span>📞 {booking.renter_phone}</span>
          {booking.renter_email && <span>✉️ {booking.renter_email}</span>}
          <span>🎁 {booking.addon_count} add-on{booking.addon_count !== 1 ? 's' : ''}</span>
          {booking.has_verified_payment && <span className="text-emerald-600 font-semibold">💰 Payment verified</span>}
        </div>

        {/* Action buttons */}
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {booking.status === 'pending_approval' && (
            <>
              <button
                onClick={() => onAction(booking.id, 'approve')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 transition-colors"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-colors"
              >
                ✕ Reject
              </button>
            </>
          )}

          {booking.status === 'approved_pending_deposit' && (
            <button
              onClick={() => onAction(booking.id, 'mark_paid')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-400 transition-colors"
            >
              💳 Mark Deposit Paid
            </button>
          )}

          {/* WhatsApp triggers */}
          {booking.status === 'pending_approval' && (
            <a
              href={whatsappUrl(booking.renter_phone, approveMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200 transition-colors"
            >
              💬 WhatsApp Approval
            </a>
          )}
          {booking.status === 'approved_pending_deposit' && (
            <a
              href={whatsappUrl(booking.renter_phone, depositMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200 transition-colors"
            >
              💬 WhatsApp Confirmed
            </a>
          )}

          {/* Caretaker WhatsApp */}
          <a
            href={whatsappUrl('6799001234', `New booking alert: ${booking.event_title} — ${formatDate(booking.start_time)} — Ref: ${booking.reference_code}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-100 text-teal-700 text-xs font-semibold hover:bg-teal-200 transition-colors"
          >
            🔔 Notify Caretaker
          </a>

          {/* iCal export */}
          {['approved_pending_deposit', 'confirmed'].includes(booking.status) && (
            <button
              onClick={handleIcal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sand-100 text-sand-700 text-xs font-semibold hover:bg-sand-200 transition-colors"
            >
              📅 Export .ics
            </button>
          )}

          <button
            onClick={() => setExpanded(e => !e)}
            className="ml-auto flex items-center gap-1 px-2 py-2 rounded-xl text-sand-400 hover:text-sand-600 hover:bg-sand-100 text-xs transition-colors"
          >
            {expanded ? '▲ Less' : '▼ More'}
          </button>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="px-4 pb-5 pt-0 space-y-3 border-t border-sand-100">
            {booking.notes && (
              <div className="bg-sand-50 rounded-xl p-3 text-xs text-sand-600">
                <span className="font-semibold">Notes: </span>{booking.notes}
              </div>
            )}
            {booking.rejection_reason && (
              <div className="bg-red-50 rounded-xl p-3 text-xs text-red-700">
                <span className="font-semibold">Rejection reason: </span>{booking.rejection_reason}
              </div>
            )}
            <div className="text-xs text-sand-400 font-mono">
              Created: {new Date(booking.created_at).toLocaleString('en-FJ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<BookingSummary[]>(MOCK_ADMIN_BOOKINGS)
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'kanban'>('list')

  const handleAction = (id: string, action: 'approve' | 'reject' | 'mark_paid' | 'confirm', reason?: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b
      if (action === 'approve') return { ...b, status: 'approved_pending_deposit' }
      if (action === 'reject')  return { ...b, status: 'rejected', rejection_reason: reason ?? null }
      if (action === 'mark_paid') return { ...b, status: 'confirmed', has_verified_payment: true }
      return b
    }))
  }

  const filtered = bookings.filter(b => {
    const matchStatus = filterStatus === 'all' || b.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q || [b.renter_name, b.event_title, b.reference_code, b.space_name].some(v => v.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  const counts = STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: bookings.filter(b => b.status === s).length }), {} as Record<BookingStatus, number>)
  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.total_amount_fjd, 0)

  const handleIcalAll = () => {
    const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'approved_pending_deposit')
    confirmed.forEach(b => {
      const content = buildICal({
        uid: b.id,
        summary: `[RENTAL] ${b.event_title}`,
        location: `${b.venue_name} — ${b.space_name}`,
        start: b.start_time,
        end: b.end_time,
        description: `Renter: ${b.renter_name} | Ref: ${b.reference_code}`,
      })
      downloadICal(content, `${b.reference_code}.ics`)
    })
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <header className="bg-teal-900 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span>🏝️</span>
              <span className="font-bold">eBooking Fiji</span>
            </button>
            <span className="text-teal-400 text-sm">/ Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleIcalAll}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-sm font-semibold transition-colors"
            >
              📅 Export All iCal
            </button>
            <button
              onClick={() => navigate('/book')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-400 text-sm font-bold transition-colors"
            >
              + New Booking
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Pending Review', value: counts.pending_approval,        color: 'bg-amber-100 text-amber-800 border-amber-200',   icon: '🕐' },
            { label: 'Awaiting Deposit', value: counts.approved_pending_deposit, color: 'bg-blue-100 text-blue-800 border-blue-200',   icon: '💳' },
            { label: 'Confirmed',        value: counts.confirmed,              color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '✅' },
            { label: 'Rejected',         value: counts.rejected,               color: 'bg-red-100 text-red-800 border-red-200',         icon: '❌' },
            { label: 'Revenue (confirmed)', value: FJD(totalRevenue),          color: 'bg-teal-100 text-teal-800 border-teal-200',      icon: '💰' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border-2 p-4 ${s.color}`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{s.value}</div>
              <div className="text-xs mt-0.5 opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            type="search"
            placeholder="Search by name, event, reference…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] border-2 border-sand-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400 transition-colors"
          />

          <div className="flex items-center gap-1 bg-white border-2 border-sand-200 rounded-xl p-1">
            {[{ key: 'all', label: 'All' }, ...STATUS_ORDER.map(s => ({ key: s, label: STATUS_ICONS[s] + ' ' + (s === 'pending_approval' ? 'Pending' : s === 'approved_pending_deposit' ? 'Deposit' : STATUS_LABELS[s]) }))].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key as BookingStatus | 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterStatus === f.key ? 'bg-teal-600 text-white' : 'text-sand-600 hover:bg-sand-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white border-2 border-sand-200 rounded-xl p-1">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'list' ? 'bg-teal-600 text-white' : 'text-sand-600 hover:bg-sand-100'}`}
            >
              ☰ List
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'kanban' ? 'bg-teal-600 text-white' : 'text-sand-600 hover:bg-sand-100'}`}
            >
              ⬛ Kanban
            </button>
          </div>
        </div>

        {/* LIST view */}
        {view === 'list' && (
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-sand-400">
                <div className="text-4xl mb-3">📭</div>
                <div className="font-semibold">No bookings match your filter</div>
              </div>
            )}
            {filtered.map(b => (
              <BookingCard key={b.id} booking={b} onAction={handleAction} />
            ))}
          </div>
        )}

        {/* KANBAN view */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {STATUS_ORDER.map(status => {
              const cols = bookings.filter(b => b.status === status)
              return (
                <div key={status} className="min-w-[220px]">
                  <div className={`text-xs font-bold px-3 py-2 rounded-xl mb-3 flex items-center gap-1.5 border ${STATUS_COLORS[status]}`}>
                    <span>{STATUS_ICONS[status]}</span>
                    <span>{STATUS_LABELS[status]}</span>
                    <span className="ml-auto bg-white/60 rounded-full px-1.5">{cols.length}</span>
                  </div>
                  <div className="space-y-3">
                    {cols.map(b => (
                      <div
                        key={b.id}
                        className={`bg-white rounded-xl border-2 p-3 shadow-sm ${
                          b.status === 'pending_approval' ? 'border-amber-300' :
                          b.status === 'approved_pending_deposit' ? 'border-blue-300' :
                          b.status === 'confirmed' ? 'border-emerald-300' :
                          'border-sand-200'
                        }`}
                      >
                        <div className="font-semibold text-teal-900 text-xs leading-tight mb-1">{b.event_title}</div>
                        <div className="text-[10px] text-sand-400 font-mono mb-2">{b.reference_code}</div>
                        <div className="text-xs text-sand-600 mb-2">{b.renter_name}</div>
                        <div className="text-xs font-bold text-teal-800">{FJD(b.total_amount_fjd)}</div>

                        <div className="flex gap-1 mt-3 flex-wrap">
                          {b.status === 'pending_approval' && (
                            <>
                              <button onClick={() => handleAction(b.id, 'approve')} className="text-[10px] bg-emerald-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-emerald-400 transition-colors">✓ Approve</button>
                              <button onClick={() => handleAction(b.id, 'reject', 'Declined by admin')} className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-lg font-bold hover:bg-red-200 transition-colors">✕</button>
                            </>
                          )}
                          {b.status === 'approved_pending_deposit' && (
                            <button onClick={() => handleAction(b.id, 'mark_paid')} className="text-[10px] bg-blue-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-blue-400 transition-colors">💳 Paid</button>
                          )}
                          <a
                            href={whatsappUrl(b.renter_phone, `Update on your booking ${b.reference_code} — ${STATUS_LABELS[b.status]}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-lg font-bold hover:bg-green-200 transition-colors"
                          >
                            💬
                          </a>
                        </div>
                      </div>
                    ))}
                    {cols.length === 0 && (
                      <div className="border-2 border-dashed border-sand-200 rounded-xl p-4 text-center text-xs text-sand-300">
                        No bookings
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
