// ============================================================
// eBooking Fiji — Core TypeScript Interfaces
// ============================================================

export type BookingStatus =
  | 'pending_approval'
  | 'approved_pending_deposit'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'

export type PaymentMethod =
  | 'mpaisa_qr'
  | 'mycash'
  | 'bsp_bank_transfer'
  | 'anz_bank_transfer'
  | 'westpac_bank_transfer'

export type PaymentStatus = 'unverified' | 'verified' | 'failed'

export type AddonServiceName =
  | 'PA Sound System'
  | 'Stage Lighting'
  | 'Projector & Screen'
  | 'Sanitation Fee'
  | 'Stage Instruments'
  | 'Chair & Table Hire'
  | 'Cleaning Service'

export interface Venue {
  id: string
  slug: string
  name: string
  address: string
  city: string
  phone: string
  whatsapp: string
  caretaker_name: string
  caretaker_phone: string
  deposit_pct: number
  created_at: string
}

export interface Space {
  id: string
  venue_id: string
  space_name: string
  description: string
  capacity: number
  hourly_rate_fjd: number
  day_rate_fjd: number | null
  min_booking_hours: number
  is_active: boolean
  created_at: string
}

export interface RecurringBlackout {
  id: string
  space_id: string
  title: string
  day_of_week: number  // 0=Sun … 6=Sat
  start_time: string   // "HH:MM:SS"
  end_time: string
  is_active: boolean
}

export interface BookingAddon {
  id?: string
  booking_id?: string
  service_name: AddonServiceName
  quantity: number
  unit_price_fjd: number
}

export interface Payment {
  id: string
  booking_id: string
  payment_method: PaymentMethod
  amount_fjd: number
  transaction_reference: string | null
  receipt_image_url: string | null
  payment_status: PaymentStatus
  is_deposit: boolean
  verified_by: string | null
  verified_at: string | null
  notes: string | null
  created_at: string
}

export interface Booking {
  id: string
  reference_code: string
  space_id: string
  renter_name: string
  renter_phone: string
  renter_email: string
  event_title: string
  start_time: string  // ISO 8601
  end_time: string
  total_amount_fjd: number
  deposit_amount_fjd: number
  status: BookingStatus
  rejection_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  spaces?: Space
  booking_addons?: BookingAddon[]
  payments?: Payment[]
}

export interface BookingSummary extends Booking {
  space_name: string
  capacity: number
  venue_name: string
  venue_slug: string
  venue_whatsapp: string
  addons_total_fjd: number
  addon_count: number
  payment_count: number
  has_verified_payment: boolean
}

// -------------------------------------------------------
// Form / UI types
// -------------------------------------------------------

export interface AddonCatalogItem {
  service_name: AddonServiceName
  unit_price_fjd: number
  description: string
  icon: string
}

export const ADDON_CATALOG: AddonCatalogItem[] = [
  { service_name: 'PA Sound System',  unit_price_fjd: 150, icon: '🎤', description: 'Full PA rig, mics & mixing desk' },
  { service_name: 'Stage Lighting',   unit_price_fjd: 80,  icon: '💡', description: 'LED wash + spotlights' },
  { service_name: 'Projector & Screen', unit_price_fjd: 60, icon: '📽️', description: '4K projector, 3m screen & HDMI' },
  { service_name: 'Stage Instruments', unit_price_fjd: 120, icon: '🎹', description: 'Keyboard, drums & guitar rig' },
  { service_name: 'Chair & Table Hire', unit_price_fjd: 40, icon: '🪑', description: 'Up to 100 chairs + 10 tables' },
  { service_name: 'Sanitation Fee',   unit_price_fjd: 30,  icon: '🧼', description: 'Restroom supplies & attendant' },
  { service_name: 'Cleaning Service', unit_price_fjd: 50,  icon: '🧹', description: 'Post-event deep clean' },
]

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mpaisa_qr:           'M-PAiSA',
  mycash:              'MyCash',
  bsp_bank_transfer:   'BSP Bank Transfer',
  anz_bank_transfer:   'ANZ Bank Transfer',
  westpac_bank_transfer: 'Westpac Transfer',
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending_approval:        'Pending Approval',
  approved_pending_deposit: 'Approved — Awaiting Deposit',
  confirmed:               'Confirmed',
  rejected:                'Rejected',
  cancelled:               'Cancelled',
}

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending_approval:        'bg-amber-100 text-amber-800 border-amber-200',
  approved_pending_deposit: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed:               'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected:                'bg-red-100 text-red-800 border-red-200',
  cancelled:               'bg-gray-100 text-gray-600 border-gray-200',
}
