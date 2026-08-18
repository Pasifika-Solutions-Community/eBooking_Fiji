import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { PaymentMethod, BookingAddon } from '../types/booking'
import { FJD, formatDateTime, whatsappUrl } from '../lib/utils'
import { PAYMENT_LABELS } from '../types/booking'

interface CheckoutState {
  booking: {
    reference_code: string
    space_name: string
    venue_name: string
    renter_name: string
    renter_phone: string
    renter_email: string
    event_title: string
    start_time: string
    end_time: string
    total_amount_fjd: number
    deposit_amount_fjd: number
    notes: string
    status: string
  }
  addons: BookingAddon[]
  venue_whatsapp: string
}

const BANK_DETAILS: Record<string, { name: string; account: string; branch: string; swift?: string }> = {
  bsp_bank_transfer: {
    name: 'BSP — Bank South Pacific',
    account: '2001234567',
    branch: 'Suva Branch',
    swift: 'BSPPFJFJ',
  },
  anz_bank_transfer: {
    name: 'ANZ Fiji',
    account: '9001234567',
    branch: 'ANZ Suva Main',
    swift: 'ANZBFJFJ',
  },
  westpac_bank_transfer: {
    name: 'Westpac Fiji',
    account: '3001234567',
    branch: 'Westpac Suva',
    swift: 'WPACFJFJ',
  },
}

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as CheckoutState | null

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [payFull, setPayFull] = useState(false)
  const [transRef, setTransRef] = useState('')
  const [receipt, setReceipt] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-teal-900 mb-2">No booking found</h2>
          <button onClick={() => navigate('/book')} className="mt-4 bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold">
            Start a new booking
          </button>
        </div>
      </div>
    )
  }

  const { booking, addons, venue_whatsapp } = state
  const amountDue = payFull ? booking.total_amount_fjd : booking.deposit_amount_fjd
  const addonsTotal = addons.reduce((s, a) => s + a.quantity * a.unit_price_fjd, 0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setReceipt(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => setReceiptPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    setSubmitted(true)
  }

  // ---- Success screen ------------------------------------------------
  if (submitted) {
    const waMsg = `Hi! I've submitted my payment receipt for booking *${booking.reference_code}* — ${booking.event_title} at ${booking.venue_name}. Please verify and confirm my booking. Thank you! 🙏`
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(160deg, #f0fbfa 0%, #fdfbf8 100%)' }}>
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-sand-200">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">✅</div>
            <h2 className="text-2xl font-bold text-teal-900 mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Payment Submitted!
            </h2>
            <p className="text-sand-600 text-sm mb-2">Reference: <span className="font-bold text-teal-700 font-mono">{booking.reference_code}</span></p>
            <p className="text-sand-500 text-sm mb-6">
              Your receipt is under review. You'll receive a WhatsApp confirmation within 24 hours once verified.
            </p>

            <a
              href={whatsappUrl(venue_whatsapp, waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-400 transition-colors mb-3"
            >
              <span className="text-xl">💬</span> Message Venue on WhatsApp
            </a>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-2xl border-2 border-sand-200 text-teal-700 font-semibold hover:border-teal-300 transition-colors text-sm"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0fbfa 0%, #fdfbf8 100%)' }}>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-sand-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/book')} className="flex items-center gap-2 text-teal-700 font-bold">
            <span>🏝️</span> eBooking Fiji
          </button>
          <div className="font-mono text-xs text-sand-500">{booking.reference_code}</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        <h1 className="text-3xl font-bold text-teal-900 mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          Complete Your Booking
        </h1>
        <p className="text-sand-500 text-sm mb-8">
          Your request is pending approval. Pay the deposit now to secure your slot.
        </p>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-5">
            {/* Booking summary card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🏛️</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-teal-900">{booking.event_title}</div>
                  <div className="text-sand-500 text-xs">{booking.venue_name} · {booking.space_name}</div>
                  <div className="text-sand-600 text-xs mt-1 font-mono">
                    {formatDateTime(booking.start_time)} – {new Date(booking.end_time).toLocaleTimeString('en-FJ', { hour: '2-digit', minute: '2-digit', timeZone: 'Pacific/Fiji' })}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">Pending Approval</div>
                </div>
              </div>
            </div>

            {/* Deposit toggle */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200">
              <h3 className="font-bold text-teal-900 mb-3">Payment Amount</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setPayFull(false)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${!payFull ? 'border-teal-500 bg-teal-50' : 'border-sand-200 hover:border-teal-300'}`}
                >
                  <div className="font-bold text-teal-900 text-lg">{FJD(booking.deposit_amount_fjd)}</div>
                  <div className="text-xs text-sand-500 mt-0.5">30% Deposit (required to hold slot)</div>
                  {!payFull && <div className="text-xs text-teal-600 font-semibold mt-1">✓ Selected</div>}
                </button>
                <button
                  onClick={() => setPayFull(true)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${payFull ? 'border-teal-500 bg-teal-50' : 'border-sand-200 hover:border-teal-300'}`}
                >
                  <div className="font-bold text-teal-900 text-lg">{FJD(booking.total_amount_fjd)}</div>
                  <div className="text-xs text-sand-500 mt-0.5">Full Payment (save admin follow-up)</div>
                  {payFull && <div className="text-xs text-teal-600 font-semibold mt-1">✓ Selected</div>}
                </button>
              </div>
            </div>

            {/* Payment method selection */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200">
              <h3 className="font-bold text-teal-900 mb-4">Select Payment Method</h3>

              {/* Mobile wallets */}
              <div className="mb-4">
                <div className="text-xs font-mono text-sand-400 mb-2 uppercase tracking-wider">Mobile Wallets</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(['mpaisa_qr', 'mycash'] as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === method ? 'border-teal-500 bg-teal-50' : 'border-sand-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method === 'mpaisa_qr' ? '📱' : '💳'}</div>
                      <div className="font-bold text-sm text-teal-900">{PAYMENT_LABELS[method]}</div>
                      <div className="text-xs text-sand-500">Scan QR · instant</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank transfers */}
              <div>
                <div className="text-xs font-mono text-sand-400 mb-2 uppercase tracking-wider">Bank Transfer</div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {(['bsp_bank_transfer', 'anz_bank_transfer', 'westpac_bank_transfer'] as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === method ? 'border-teal-500 bg-teal-50' : 'border-sand-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="text-xl mb-1">🏦</div>
                      <div className="font-bold text-xs text-teal-900">{PAYMENT_LABELS[method]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment instructions */}
            {paymentMethod && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200 space-y-5">
                <h3 className="font-bold text-teal-900">Payment Instructions</h3>

                {/* Mobile wallet QR */}
                {(paymentMethod === 'mpaisa_qr' || paymentMethod === 'mycash') && (
                  <div className="text-center space-y-4">
                    <div className="inline-block bg-sand-50 border-2 border-sand-200 rounded-2xl p-6">
                      {/* Simulated QR code using CSS grid pattern */}
                      <div
                        className="w-36 h-36 mx-auto border-4 border-teal-900 rounded-lg"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144' height='144'%3E%3Crect width='144' height='144' fill='white'/%3E%3Crect x='8' y='8' width='40' height='40' rx='4' fill='%23133d38'/%3E%3Crect x='14' y='14' width='28' height='28' rx='2' fill='white'/%3E%3Crect x='19' y='19' width='18' height='18' fill='%23133d38'/%3E%3Crect x='96' y='8' width='40' height='40' rx='4' fill='%23133d38'/%3E%3Crect x='102' y='14' width='28' height='28' rx='2' fill='white'/%3E%3Crect x='107' y='19' width='18' height='18' fill='%23133d38'/%3E%3Crect x='8' y='96' width='40' height='40' rx='4' fill='%23133d38'/%3E%3Crect x='14' y='102' width='28' height='28' rx='2' fill='white'/%3E%3Crect x='19' y='107' width='18' height='18' fill='%23133d38'/%3E%3Crect x='56' y='8' width='8' height='8' fill='%23133d38'/%3E%3Crect x='72' y='8' width='8' height='8' fill='%23133d38'/%3E%3Crect x='64' y='16' width='8' height='8' fill='%23133d38'/%3E%3Crect x='56' y='24' width='16' height='8' fill='%23133d38'/%3E%3Crect x='56' y='56' width='32' height='8' fill='%23133d38'/%3E%3Crect x='56' y='72' width='8' height='32' fill='%23133d38'/%3E%3Crect x='72' y='64' width='32' height='8' fill='%23133d38'/%3E%3Crect x='96' y='72' width='8' height='32' fill='%23133d38'/%3E%3Crect x='104' y='80' width='8' height='8' fill='%23133d38'/%3E%3Crect x='112' y='88' width='24' height='8' fill='%23133d38'/%3E%3Crect x='80' y='96' width='8' height='8' fill='%23133d38'/%3E%3Crect x='64' y='104' width='8' height='16' fill='%23133d38'/%3E%3C/svg%3E")`,
                          backgroundSize: 'cover',
                        }}
                      />
                      <div className="mt-3 text-xs font-bold text-teal-900">
                        {paymentMethod === 'mpaisa_qr' ? 'M-PAiSA' : 'MyCash'}
                      </div>
                      <div className="text-2xl font-bold text-coral-600">{FJD(amountDue)}</div>
                    </div>

                    <div className="text-sm text-sand-600 max-w-xs mx-auto">
                      Open your <strong>{paymentMethod === 'mpaisa_qr' ? 'M-PAiSA' : 'MyCash'}</strong> app, tap <em>Scan QR</em>, and confirm the payment of {FJD(amountDue)}.
                    </div>

                    {/* Reference number */}
                    <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-sand-400 font-mono">Payment Reference</div>
                        <div className="font-bold font-mono text-teal-900 text-sm">{booking.reference_code}</div>
                      </div>
                      <button
                        onClick={() => copy(booking.reference_code, 'ref')}
                        className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-500 transition-colors flex-shrink-0"
                      >
                        {copied === 'ref' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                      <span className="text-lg">💡</span>
                      <span>Screenshot your payment confirmation and upload it below as proof of payment.</span>
                    </div>
                  </div>
                )}

                {/* Bank transfer */}
                {paymentMethod && BANK_DETAILS[paymentMethod] && (
                  <div className="space-y-3">
                    <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
                      <div className="font-bold text-teal-900">{BANK_DETAILS[paymentMethod].name}</div>
                      {[
                        { label: 'Account Name', value: 'Calvary Temple Suva Trust' },
                        { label: 'Account Number', value: BANK_DETAILS[paymentMethod].account },
                        { label: 'Branch', value: BANK_DETAILS[paymentMethod].branch },
                        { label: 'SWIFT/BIC', value: BANK_DETAILS[paymentMethod].swift ?? 'N/A' },
                        { label: 'Amount', value: FJD(amountDue) },
                        { label: 'Reference', value: booking.reference_code },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between text-sm border-b border-sand-200 pb-2 last:border-0 last:pb-0">
                          <span className="text-sand-500 font-mono text-xs">{row.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-teal-900">{row.value}</span>
                            {['Account Number', 'Reference'].includes(row.label) && (
                              <button
                                onClick={() => copy(row.value, row.label)}
                                className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-semibold hover:bg-teal-200 transition-colors"
                              >
                                {copied === row.label ? '✓' : 'Copy'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                      <strong>Important:</strong> Include your booking reference <strong>{booking.reference_code}</strong> in the transfer description so we can match your payment.
                    </div>
                  </div>
                )}

                {/* Receipt upload */}
                <div>
                  <div className="font-semibold text-teal-900 mb-2 text-sm">Upload Payment Receipt <span className="text-coral-500">*</span></div>
                  <label className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    receipt ? 'border-teal-400 bg-teal-50' : 'border-sand-300 hover:border-teal-300 hover:bg-teal-50/50'
                  }`}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {receiptPreview ? (
                      <div className="space-y-2">
                        <img src={receiptPreview} alt="Receipt preview" className="max-h-32 mx-auto rounded-lg object-contain" />
                        <div className="text-xs text-teal-600 font-semibold">{receipt?.name}</div>
                        <div className="text-xs text-sand-500">Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl mb-2">📄</div>
                        <div className="text-sm font-semibold text-teal-700">Drop receipt here or click to upload</div>
                        <div className="text-xs text-sand-400 mt-1">PNG, JPG, or PDF · Max 5MB</div>
                      </div>
                    )}
                  </label>
                </div>

                {/* Transaction ref */}
                <div>
                  <label className="block text-sm font-semibold text-teal-900 mb-1.5">
                    Transaction Reference / Confirmation Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MPaisa-2026-8734920"
                    value={transRef}
                    onChange={e => setTransRef(e.target.value)}
                    className="w-full border-2 border-sand-200 rounded-xl px-4 py-3 text-sm text-teal-900 placeholder-sand-400 focus:outline-none focus:border-teal-400 transition-colors font-mono"
                  />
                </div>

                <button
                  disabled={!receipt || submitting}
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-2xl bg-coral-500 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-coral-400 transition-all hover:scale-[1.01] shadow-lg shadow-coral-500/30"
                >
                  {submitting ? 'Submitting Receipt…' : `Submit Payment Receipt · ${FJD(amountDue)}`}
                </button>
              </div>
            )}
          </div>

          {/* Right: order summary */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200">
              <div className="font-bold text-teal-900 mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                Booking Summary
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sand-500">Space hire</span>
                  <span className="font-semibold">{FJD(booking.total_amount_fjd - addonsTotal)}</span>
                </div>
                {addons.map(a => (
                  <div key={a.service_name} className="flex justify-between">
                    <span className="text-sand-500 truncate mr-2">{a.service_name}</span>
                    <span className="font-semibold">{FJD(a.unit_price_fjd * a.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-sand-200 pt-2 mt-1">
                  <div className="flex justify-between font-bold text-teal-900">
                    <span>Total</span>
                    <span>{FJD(booking.total_amount_fjd)}</span>
                  </div>
                </div>
              </div>

              <div className={`mt-4 p-3 rounded-xl border-2 ${payFull ? 'bg-teal-50 border-teal-400' : 'bg-amber-50 border-amber-300'}`}>
                <div className="text-xs font-bold mb-0.5 text-teal-900">Amount Due Now</div>
                <div className="text-2xl font-bold text-coral-600">{FJD(amountDue)}</div>
                <div className="text-xs text-sand-500 mt-0.5">{payFull ? 'Full payment' : '30% deposit'}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200">
              <div className="font-semibold text-teal-900 text-sm mb-3">Need Help?</div>
              <a
                href={whatsappUrl('6793123456', `Hi! I have a question about booking ${booking.reference_code}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-400 transition-colors"
              >
                <span>💬</span> WhatsApp the venue
              </a>
              <div className="text-xs text-sand-400 mt-2 text-center">
                Brother Sione · +679 900 1234
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
