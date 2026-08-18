import { useState, useMemo } from 'react'
import type { RecurringBlackout, Space } from '../types/booking'
import { isBlackedOut, isAlreadyBooked } from '../lib/utils'

interface ConfirmedBooking {
  space_id: string
  start_time: string
  end_time: string
  title: string
}

interface Props {
  space: Space
  blackouts: RecurringBlackout[]
  confirmedBookings: ConfirmedBooking[]
  selectedDate: Date | null
  onDateChange: (d: Date) => void
  selectedSlots: number[]           // hours in [startHour, endHour)
  onSlotsChange: (slots: number[]) => void
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 06:00–22:00

function formatHour(h: number) {
  if (h === 12) return '12 PM'
  if (h === 0)  return '12 AM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function addDays(d: Date, n: number) {
  const nd = new Date(d)
  nd.setDate(d.getDate() + n)
  return nd
}

function startOfWeek(d: Date) {
  const sd = new Date(d)
  sd.setDate(d.getDate() - d.getDay())
  sd.setHours(0, 0, 0, 0)
  return sd
}

export default function SlotPicker({
  space, blackouts, confirmedBookings,
  selectedDate, onDateChange, selectedSlots, onSlotsChange,
}: Props) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today))
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const slotState = (date: Date, hour: number) => {
    const isPast = date < today
    const blackout = isBlackedOut(date, hour, blackouts, space.id)
    const booked  = isAlreadyBooked(date, hour, confirmedBookings, space.id)
    const isToday = date.toDateString() === today.toDateString()
    const isSelected =
      selectedDate?.toDateString() === date.toDateString() &&
      selectedSlots.includes(hour)
    return { isPast, blackout, booked, isToday, isSelected }
  }

  const handleSlotClick = (date: Date, hour: number) => {
    const { isPast, blackout, booked } = slotState(date, hour)
    if (isPast || blackout || booked) return

    if (selectedDate?.toDateString() !== date.toDateString()) {
      onDateChange(date)
      onSlotsChange([hour])
      return
    }
    // Toggle on same day
    const next = selectedSlots.includes(hour)
      ? selectedSlots.filter(h => h !== hour)
      : [...selectedSlots, hour].sort((a, b) => a - b)
    // Enforce contiguous selection
    if (next.length > 1) {
      const mn = Math.min(...next)
      const mx = Math.max(...next)
      const contiguous = Array.from({ length: mx - mn + 1 }, (_, i) => mn + i)
      onSlotsChange(contiguous)
    } else {
      onSlotsChange(next)
    }
  }

  const handleMouseDown = (date: Date, hour: number) => {
    const { isPast, blackout, booked } = slotState(date, hour)
    if (isPast || blackout || booked) return
    setDragging(true)
    setDragStart(hour)
    onDateChange(date)
    onSlotsChange([hour])
  }

  const handleMouseEnter = (date: Date, hour: number) => {
    if (!dragging || dragStart === null) return
    if (date.toDateString() !== selectedDate?.toDateString()) return
    const mn = Math.min(dragStart, hour)
    const mx = Math.max(dragStart, hour)
    const range = Array.from({ length: mx - mn + 1 }, (_, i) => mn + i)
    // Filter out blocked slots from range
    const valid = range.filter(h => {
      const { isPast, blackout, booked } = slotState(date, h)
      return !isPast && !blackout && !booked
    })
    onSlotsChange(valid)
  }

  const durationHours = selectedSlots.length
  const meetsMin = durationHours >= space.min_booking_hours

  return (
    <div
      className="select-none"
      onMouseUp={() => setDragging(false)}
    >
      {/* Week nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 flex items-center justify-center font-bold transition-colors"
        >‹</button>

        <div className="text-center">
          <div className="font-bold text-teal-900 text-sm">
            {weekStart.toLocaleDateString('en-FJ', { month: 'long', year: 'numeric' })}
          </div>
          <div className="text-xs text-sand-500 font-mono">
            {weekDays[0].toLocaleDateString('en-FJ', { day: 'numeric', month: 'short' })} –{' '}
            {weekDays[6].toLocaleDateString('en-FJ', { day: 'numeric', month: 'short' })}
          </div>
        </div>

        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 flex items-center justify-center font-bold transition-colors"
        >›</button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white shadow-sm">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-sand-200">
            <div className="p-2" />
            {weekDays.map(d => {
              const isPast = d < today
              const isToday = d.toDateString() === today.toDateString()
              const isActive = selectedDate?.toDateString() === d.toDateString()
              return (
                <div
                  key={d.toISOString()}
                  className={`p-2 text-center border-l border-sand-100 ${isPast ? 'opacity-40' : ''}`}
                >
                  <div className={`text-[10px] font-mono uppercase tracking-wider ${isToday ? 'text-coral-500' : 'text-sand-500'}`}>
                    {d.toLocaleDateString('en-FJ', { weekday: 'short' })}
                  </div>
                  <div className={`text-sm font-bold mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full ${
                    isActive ? 'bg-teal-600 text-white' : isToday ? 'bg-coral-100 text-coral-700' : 'text-teal-900'
                  }`}>
                    {d.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hour rows */}
          {HOURS.map(hour => (
            <div
              key={hour}
              className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-sand-100 last:border-0"
            >
              <div className="p-1 pr-2 text-right text-[10px] text-sand-400 font-mono pt-2">
                {formatHour(hour)}
              </div>
              {weekDays.map(d => {
                const { isPast, blackout, booked, isSelected } = slotState(d, hour)
                const unavailable = isPast || !!blackout || booked

                return (
                  <div
                    key={d.toISOString()}
                    title={blackout?.title ?? (booked ? 'Already booked' : undefined)}
                    onMouseDown={() => handleMouseDown(d, hour)}
                    onMouseEnter={() => handleMouseEnter(d, hour)}
                    onClick={() => handleSlotClick(d, hour)}
                    className={`border-l border-sand-100 h-8 transition-colors relative ${
                      unavailable
                        ? 'cursor-not-allowed'
                        : 'cursor-pointer hover:bg-teal-50'
                    } ${
                      blackout ? 'bg-red-50' :
                      booked   ? 'bg-amber-50' :
                      isPast   ? 'bg-sand-50 opacity-40' :
                      isSelected ? 'bg-teal-500' : ''
                    }`}
                  >
                    {blackout && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[2px] bg-red-300 opacity-60" />
                      </div>
                    )}
                    {booked && (
                      <div className="absolute inset-x-0.5 inset-y-0.5 rounded bg-amber-200/60 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-sand-600">
        {[
          { color: 'bg-teal-500', label: 'Your selection' },
          { color: 'bg-red-100 border border-red-300', label: 'Church service (unavailable)' },
          { color: 'bg-amber-100 border border-amber-300', label: 'Already booked' },
          { color: 'bg-sand-100 border border-sand-200', label: 'Past / unavailable' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${l.color}`} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Selection summary */}
      {selectedDate && selectedSlots.length > 0 && (
        <div className={`mt-4 p-4 rounded-2xl border-2 ${meetsMin ? 'border-teal-400 bg-teal-50' : 'border-amber-400 bg-amber-50'}`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{meetsMin ? '✅' : '⚠️'}</div>
            <div>
              <div className="font-bold text-teal-900 text-sm">
                {selectedDate.toLocaleDateString('en-FJ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="text-sm text-teal-700 mt-0.5">
                {formatHour(Math.min(...selectedSlots))} → {formatHour(Math.max(...selectedSlots) + 1)}
                {' '}·{' '}
                <span className="font-semibold">{durationHours} hr{durationHours !== 1 ? 's' : ''}</span>
              </div>
              {!meetsMin && (
                <div className="text-amber-700 text-xs mt-1 font-medium">
                  Minimum booking is {space.min_booking_hours} hours for this space.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
