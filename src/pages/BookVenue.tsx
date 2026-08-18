import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SlotPicker from '../components/SlotPicker'
import { ADDON_CATALOG, type AddonServiceName, type BookingAddon } from '../types/booking'
import { MOCK_VENUE, MOCK_SPACES, MOCK_BLACKOUTS, MOCK_CONFIRMED_BOOKINGS } from '../lib/mockData'
import { FJD, generateRefCode } from '../lib/utils'

export default function BookVenue() {
  const navigate = useNavigate()
  const venue = MOCK_VENUE
  const spaces = MOCK_SPACES

  const [spaceIdx, setSpaceIdx] = useState(0)
  const space = spaces[spaceIdx]

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<number[]>([])

  const [addons, setAddons] = useState<Record<AddonServiceName, number>>({} as Record<AddonServiceName, number>)

  const [form, setForm] = useState({
    renter_name: '',
    renter_phone: '',
    renter_email: '',
    event_title: '',
    notes: '',
  })

  const [step, setStep] = useState<'pick' | 'details' | 'review'>('pick')
  const [submitting, setSubmitting] = useState(false)

  // ---- Cost calculations -------------------------------------------
  const durationHours = selectedSlots.length
  const spaceTotal = durationHours * space.hourly_rate_fjd
  const addonsTotal = ADDON_CATALOG.reduce((sum, item) => {
    const qty = addons[item.service_name] ?? 0
    return sum + qty * item.unit_price_fjd
  }, 0)
  const totalAmount = spaceTotal + addonsTotal
  const depositAmount = +(totalAmount * (venue.deposit_pct / 100)).toFixed(2)

  const meetsMin = durationHours >= space.min_booking_hours

  const canProceedToDetails =
    selectedDate !== null &&
    selectedSlots.length > 0 &&
    meetsMin

  const canProceedToReview =
    form.renter_name.trim() &&
    form.renter_phone.trim() &&
    form.event_title.trim()

  // ---- Addon toggle ---------------------------------------------------
  const toggleAddon = (name: AddonServiceName) => {
    setAddons(prev => ({
      ...prev,
      [name]: prev[name] ? 0 : 1,
    }))
  }

  // ---- Slot times -------------------------------------------------------
  const startTime = useMemo(() => {
    if (!selectedDate || selectedSlots.length === 0) return null
    const d = new Date(selectedDate)
    d.setHours(Math.min(...selectedSlots), 0, 0, 0)
    return d
  }, [selectedDate, selectedSlots])

  const endTime = useMemo(() => {
    if (!selectedDate || selectedSlots.length === 0) return null
    const d = new Date(selectedDate)
    d.setHours(Math.max(...selectedSlots) + 1, 0, 0, 0)
    return d
  }, [selectedDate, selectedSlots])

  // ---- Submit -----------------------------------------------------------
  const handleSubmit = async () => {
    if (!startTime || !endTime) return
    setSubmitting(true)

    // Simulate API call — replace with real Supabase insert
    await new Promise(r => setTimeout(r, 900))

    const refCode = generateRefCode()
    const addonList: BookingAddon[] = ADDON_CATALOG
      .filter(a => (addons[a.service_name] ?? 0) > 0)
      .map(a => ({
        service_name: a.service_name,
        quantity: addons[a.service_name],
        unit_price_fjd: a.unit_price_fjd,
      }))

    // In production: insert to Supabase, get back the real booking ID.
    // Here we pass state to checkout via router.
    navigate('/checkout/demo', {
      state: {
        booking: {
          reference_code: refCode,
          space_id: space.id,
          space_name: space.space_name,
          venue_name: venue.name,
          renter_name: form.renter_name,
          renter_phone: form.renter_phone,
          renter_email: form.renter_email,
          event_title: form.event_title,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          total_amount_fjd: totalAmount,
          deposit_amount_fjd: depositAmount,
          notes: form.notes,
          status: 'pending_approval',
        },
        addons: addonList,
        venue_whatsapp: venue.whatsapp,
      },
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0fbfa 0%, #fdfbf8 60%, #fff3ef 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-sand-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-teal-700 hover:text-teal-900 font-bold">
            <span>🏝️</span> eBooking Fiji
          </button>
          <div className="text-sm text-sand-500">
            <span className="font-semibold text-teal-800">{venue.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
        {/* Venue hero */}
        <div className="rounded-3xl overflow-hidden mb-8 relative h-48 bg-teal-800">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop&auto=format"
            alt={venue.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-end p-6">
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                {venue.name}
              </h1>
              <p className="text-teal-200 text-sm mt-1">📍 {venue.address}, {venue.city}</p>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-8">
          {['Select Time', 'Your Details', 'Review & Book'].map((label, i) => {
            const stepKey = ['pick', 'details', 'review'][i]
            const active = step === stepKey
            const done = ['pick', 'details', 'review'].indexOf(step) > i
            return (
              <div key={label} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active ? 'bg-teal-600 text-white' :
                  done   ? 'bg-teal-100 text-teal-700' :
                           'text-sand-400'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    active ? 'bg-white text-teal-700' :
                    done   ? 'bg-teal-600 text-white' :
                             'bg-sand-200 text-sand-500'
                  }`}>{done ? '✓' : i + 1}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-teal-400' : 'bg-sand-200'}`} />}
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Main content */}
          <div>
            {/* STEP 1: Pick */}
            {step === 'pick' && (
              <div className="space-y-6">
                {/* Space tabs */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand-200">
                  <h2 className="font-bold text-teal-900 mb-4 text-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    Choose a Space
                  </h2>
                  <div className="flex flex-wrap gap-3 mb-5">
                    {spaces.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => { setSpaceIdx(i); setSelectedSlots([]); setSelectedDate(null) }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          spaceIdx === i
                            ? 'border-teal-500 bg-teal-50 text-teal-800'
                            : 'border-sand-200 text-sand-600 hover:border-teal-300 hover:text-teal-700'
                        }`}
                      >
                        <span>{i === 0 ? '🏛️' : i === 1 ? '🏠' : '🎯'}</span>
                        <span>{s.space_name}</span>
                        <span className="text-xs opacity-70 font-normal">·{' '}{s.capacity} cap</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    {[
                      { icon: '👥', label: 'Capacity', value: `${space.capacity} guests` },
                      { icon: '⏱️', label: 'Hourly Rate', value: FJD(space.hourly_rate_fjd) + '/hr' },
                      { icon: '🕒', label: 'Min Booking', value: `${space.min_booking_hours} hrs` },
                    ].map(m => (
                      <div key={m.label} className="flex items-center gap-2 p-3 bg-sand-50 rounded-xl border border-sand-200">
                        <span className="text-lg">{m.icon}</span>
                        <div>
                          <div className="text-xs text-sand-500 font-mono">{m.label}</div>
                          <div className="font-bold text-teal-900">{m.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slot Picker */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand-200">
                  <h2 className="font-bold text-teal-900 mb-1 text-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    Select Date & Time
                  </h2>
                  <p className="text-sand-500 text-xs mb-4">Click and drag to select consecutive hours</p>
                  <SlotPicker
                    space={space}
                    blackouts={MOCK_BLACKOUTS}
                    confirmedBookings={MOCK_CONFIRMED_BOOKINGS}
                    selectedDate={selectedDate}
                    onDateChange={d => { setSelectedDate(d); setSelectedSlots([]) }}
                    selectedSlots={selectedSlots}
                    onSlotsChange={setSelectedSlots}
                  />
                </div>

                {/* Add-ons */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand-200">
                  <h2 className="font-bold text-teal-900 mb-4 text-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    Equipment & Add-ons
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {ADDON_CATALOG.map(item => {
                      const active = (addons[item.service_name] ?? 0) > 0
                      return (
                        <button
                          key={item.service_name}
                          onClick={() => toggleAddon(item.service_name)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            active
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-sand-200 hover:border-teal-300'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                            active ? 'bg-teal-100' : 'bg-sand-100'
                          }`}>{item.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-teal-900 leading-tight">{item.service_name}</div>
                            <div className="text-xs text-sand-500 truncate">{item.description}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-teal-700 text-sm">{FJD(item.unit_price_fjd)}</div>
                            {active && <div className="text-[10px] text-teal-500 font-mono">Added ✓</div>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  disabled={!canProceedToDetails}
                  onClick={() => setStep('details')}
                  className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-500 transition-all hover:scale-[1.01] shadow-lg shadow-teal-600/30"
                >
                  Continue to Your Details →
                </button>
              </div>
            )}

            {/* STEP 2: Details */}
            {step === 'details' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand-200 space-y-5">
                <button onClick={() => setStep('pick')} className="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
                  ← Back to time selection
                </button>
                <h2 className="font-bold text-teal-900 text-xl" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  Your Contact Details
                </h2>

                {[
                  { key: 'renter_name', label: 'Full Name', placeholder: 'Mere Vunilagi', type: 'text', required: true },
                  { key: 'renter_phone', label: 'Phone (WhatsApp)', placeholder: '+679 770 1234', type: 'tel', required: true },
                  { key: 'renter_email', label: 'Email Address', placeholder: 'mere@example.com', type: 'email', required: false },
                  { key: 'event_title', label: 'Event Name', placeholder: 'Graduation Ceremony 2026', type: 'text', required: true },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-teal-900 mb-1.5">
                      {f.label} {f.required && <span className="text-coral-500">*</span>}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full border-2 border-sand-200 rounded-xl px-4 py-3 text-sm text-teal-900 placeholder-sand-400 focus:outline-none focus:border-teal-400 transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-teal-900 mb-1.5">Additional Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Any special setup requirements, setup time needed before the event, etc."
                    value={form.notes}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border-2 border-sand-200 rounded-xl px-4 py-3 text-sm text-teal-900 placeholder-sand-400 focus:outline-none focus:border-teal-400 transition-colors resize-none"
                  />
                </div>

                <button
                  disabled={!canProceedToReview}
                  onClick={() => setStep('review')}
                  className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/30"
                >
                  Review Booking →
                </button>
              </div>
            )}

            {/* STEP 3: Review */}
            {step === 'review' && (
              <div className="space-y-4">
                <button onClick={() => setStep('details')} className="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
                  ← Back to details
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand-200">
                  <h2 className="font-bold text-teal-900 text-xl mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    Review Your Booking
                  </h2>

                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Venue', value: venue.name },
                      { label: 'Space', value: space.space_name },
                      { label: 'Date', value: selectedDate?.toLocaleDateString('en-FJ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) ?? '' },
                      { label: 'Time', value: startTime && endTime ? `${startTime.toLocaleTimeString('en-FJ', { hour: '2-digit', minute: '2-digit' })} – ${endTime.toLocaleTimeString('en-FJ', { hour: '2-digit', minute: '2-digit' })}` : '' },
                      { label: 'Duration', value: `${durationHours} hours` },
                      { label: 'Renter', value: form.renter_name },
                      { label: 'Contact', value: form.renter_phone },
                      { label: 'Event', value: form.event_title },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between border-b border-sand-100 pb-2">
                        <span className="text-sand-500 font-mono text-xs">{r.label}</span>
                        <span className="font-semibold text-teal-900 text-right">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-sm">
                  <div className="font-bold text-amber-900 mb-1 flex items-center gap-2">
                    📋 Booking is subject to church approval
                  </div>
                  <div className="text-amber-700 text-xs leading-relaxed">
                    Your request will be reviewed by {venue.caretaker_name} within 24–48 hours. You'll receive a WhatsApp confirmation once approved, along with deposit payment instructions.
                  </div>
                </div>

                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-2xl bg-coral-500 text-white font-bold text-base hover:bg-coral-400 transition-all hover:scale-[1.01] shadow-lg shadow-coral-500/30 disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit Booking Request ✓'}
                </button>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200">
              <h3 className="font-bold text-teal-900 mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                Order Summary
              </h3>

              {selectedSlots.length > 0 ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sand-600">{space.space_name}</span>
                    <span className="font-semibold">{FJD(spaceTotal)}</span>
                  </div>
                  <div className="text-xs text-sand-400 font-mono -mt-1">
                    {durationHours} hrs × {FJD(space.hourly_rate_fjd)}/hr
                  </div>

                  {ADDON_CATALOG.filter(a => (addons[a.service_name] ?? 0) > 0).map(a => (
                    <div key={a.service_name} className="flex justify-between">
                      <span className="text-sand-600">{a.icon} {a.service_name}</span>
                      <span className="font-semibold">{FJD(a.unit_price_fjd)}</span>
                    </div>
                  ))}

                  <div className="border-t border-sand-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-teal-900">
                      <span>Total</span>
                      <span>{FJD(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-coral-600 mt-1 font-semibold">
                      <span>Deposit Due ({venue.deposit_pct}%)</span>
                      <span>{FJD(depositAmount)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sand-400 text-xs text-center py-4">
                  Select a time slot to see pricing
                </div>
              )}

              <div className="mt-4 p-3 bg-sand-50 rounded-xl text-xs text-sand-600 space-y-1">
                <div className="font-semibold text-sand-700">Included with every booking:</div>
                <div>✓ Parking for 50+ vehicles</div>
                <div>✓ Restroom facilities</div>
                <div>✓ Basic tables & chairs</div>
                <div>✓ WhatsApp support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
