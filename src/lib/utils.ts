import type { RecurringBlackout } from '../types/booking'

export const FJD = (amount: number) =>
  `FJ$${amount.toLocaleString('en-FJ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-FJ', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Pacific/Fiji',
  })

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-FJ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Pacific/Fiji',
  })

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-FJ', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Pacific/Fiji',
  })

export const hoursBetween = (start: Date, end: Date) =>
  (end.getTime() - start.getTime()) / 3_600_000

/** True if [slotStart, slotEnd) overlaps a blackout rule on the given date */
export function isBlackedOut(
  date: Date,
  slotHour: number,
  blackouts: RecurringBlackout[],
  spaceId: string,
): RecurringBlackout | null {
  const dow = date.getDay()
  for (const b of blackouts) {
    if (b.space_id !== spaceId) continue
    if (b.day_of_week !== dow) continue
    const [bsh, bsm] = b.start_time.split(':').map(Number)
    const [beh, bem] = b.end_time.split(':').map(Number)
    const bStart = bsh + bsm / 60
    const bEnd = beh + bem / 60
    if (slotHour >= bStart && slotHour < bEnd) return b
  }
  return null
}

/** True if the slot overlaps any existing confirmed booking */
export function isAlreadyBooked(
  date: Date,
  slotHour: number,
  confirmedBookings: Array<{ start_time: string; end_time: string; space_id: string }>,
  spaceId: string,
): boolean {
  const slotStart = new Date(date)
  slotStart.setHours(slotHour, 0, 0, 0)
  const slotEnd = new Date(slotStart)
  slotEnd.setHours(slotHour + 1, 0, 0, 0)

  return confirmedBookings.some(b => {
    if (b.space_id !== spaceId) return false
    const bs = new Date(b.start_time)
    const be = new Date(b.end_time)
    return slotStart < be && slotEnd > bs
  })
}

/** Build WhatsApp message URL */
export function whatsappUrl(phone: string, message: string) {
  const clean = phone.replace(/\D/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

/** Build iCal VCALENDAR string for a booking */
export function buildICal(params: {
  uid: string
  summary: string
  location: string
  start: string
  end: string
  description: string
}) {
  const fmt = (iso: string) =>
    iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '').replace('Z', 'Z')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//eBooking Fiji//EN',
    'BEGIN:VEVENT',
    `UID:${params.uid}@ebooking.fj`,
    `SUMMARY:${params.summary}`,
    `LOCATION:${params.location}`,
    `DTSTART:${fmt(params.start)}`,
    `DTEND:${fmt(params.end)}`,
    `DESCRIPTION:${params.description}`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadICal(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function generateRefCode(prefix = 'CT') {
  const year = new Date().getFullYear()
  const seq = String(Math.floor(1000 + Math.random() * 9000))
  return `${prefix}-${year}-${seq}`
}
