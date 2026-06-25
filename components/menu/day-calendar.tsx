"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

export type CalendarMeal = {
  _id: string
  startHour: number
  endHour?: number
  note?: string
  mealType: { _id: string; name: string; color?: string } | null
  menuItems: { _id: string; title: string }[]
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const ROW_H = 56 // px per hour row
const GUTTER = 80 // px width of the hour-label column
const DEFAULT_COLOR = "#6366f1"

function formatHour(hour: number) {
  const period = hour < 12 ? "AM" : "PM"
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:00 ${period}`
}

function formatRange(start: number, end: number) {
  if (end <= start) return formatHour(start)
  // End hour is inclusive as a slot, so the window closes at the next hour.
  return `${formatHour(start)} – ${formatHour((end + 1) % 24)}`
}

// Greedy lane packing so overlapping meals sit side by side.
function assignLanes(meals: CalendarMeal[]) {
  const sorted = [...meals].sort(
    (a, b) =>
      a.startHour - b.startHour ||
      (a.endHour ?? a.startHour) - (b.endHour ?? b.startHour),
  )
  const laneEnds: number[] = []
  const placed = sorted.map((meal) => {
    const end = meal.endHour ?? meal.startHour
    let lane = laneEnds.findIndex((laneEnd) => laneEnd < meal.startHour)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(end)
    } else {
      laneEnds[lane] = end
    }
    return { meal, lane, end }
  })
  return { placed, laneCount: Math.max(1, laneEnds.length) }
}

export function DayCalendar({
  meals,
  onSelectRange,
  onEditMeal,
  highlightHour = null,
}: {
  meals: CalendarMeal[]
  // Passing onSelectRange enables click/drag selection of an hour window.
  // Passing onEditMeal makes meal blocks clickable. Omit both for read-only.
  onSelectRange?: (startHour: number, endHour: number) => void
  onEditMeal?: (meal: CalendarMeal) => void
  highlightHour?: number | null
}) {
  const isMobile = useIsMobile()
  const canSelect = !!onSelectRange
  // Drag-to-select is desktop only; on touch it conflicts with scrolling, so
  // mobile uses a single tap to add a slot instead.
  const canDrag = canSelect && !isMobile
  const canEdit = !!onEditMeal
  const [drag, setDrag] = useState<{ anchor: number; end: number } | null>(null)
  const dragRef = useRef(drag)
  dragRef.current = drag

  // Finalize the selection on pointer release anywhere on the page.
  useEffect(() => {
    if (!canDrag) return
    const handleUp = () => {
      const current = dragRef.current
      if (current) {
        const start = Math.min(current.anchor, current.end)
        const end = Math.max(current.anchor, current.end)
        setDrag(null)
        onSelectRange?.(start, end)
      }
    }
    window.addEventListener("pointerup", handleUp)
    return () => window.removeEventListener("pointerup", handleUp)
  }, [canDrag, onSelectRange])

  const { placed, laneCount } = assignLanes(meals)

  const selStart = drag ? Math.min(drag.anchor, drag.end) : null
  const selEnd = drag ? Math.max(drag.anchor, drag.end) : null

  return (
    <div
      className="overflow-hidden rounded-lg border select-none"
      style={{ height: HOURS.length * ROW_H }}
    >
      <div className="relative" style={{ height: HOURS.length * ROW_H }}>
        {/* Hour rows (grid + labels + selection hit areas) */}
        {HOURS.map((hour) => {
          const isNow = highlightHour === hour
          return (
            <div
              key={hour}
              id={`hour-${hour}`}
              className={cn(
                "flex border-b last:border-b-0",
                isNow && "bg-primary/5",
              )}
              style={{ height: ROW_H }}
            >
              <div
                className={cn(
                  "bg-muted/30 flex w-20 shrink-0 flex-col items-end border-r px-3 pt-1.5 text-right text-xs leading-none tabular-nums",
                  isNow ? "text-primary font-semibold" : "text-muted-foreground",
                )}
              >
                {formatHour(hour)}
                {isNow && <span className="text-primary mt-0.5 text-[10px]">now</span>}
              </div>
              {/* Selection hit area. On mobile: tap to add a single slot
                  (scroll stays enabled). On desktop: click/drag a range. */}
              <div
                className={cn("flex-1", canSelect && "cursor-pointer")}
                style={canDrag ? { touchAction: "none" } : undefined}
                onClick={
                  canSelect && isMobile
                    ? () => onSelectRange?.(hour, hour)
                    : undefined
                }
                onPointerDown={
                  canDrag
                    ? (e) => {
                        e.preventDefault()
                        setDrag({ anchor: hour, end: hour })
                      }
                    : undefined
                }
                onPointerEnter={
                  canDrag
                    ? () => setDrag((d) => (d ? { ...d, end: hour } : d))
                    : undefined
                }
              />
            </div>
          )
        })}

        {/* Drag selection overlay */}
        {selStart !== null && selEnd !== null && (
          <div
            className="border-primary bg-primary/15 pointer-events-none absolute rounded-md border-2 border-dashed"
            style={{
              top: selStart * ROW_H + 2,
              height: (selEnd - selStart + 1) * ROW_H - 4,
              left: GUTTER + 4,
              right: 8,
            }}
          >
            <span className="text-primary px-2 py-1 text-xs font-medium">
              {formatRange(selStart, selEnd)}
            </span>
          </div>
        )}

        {/* Meal blocks */}
        <div
          className="pointer-events-none absolute top-0 bottom-0"
          style={{ left: GUTTER, right: 8 }}
        >
          {placed.map(({ meal, lane, end }) => {
            const span = end - meal.startHour + 1
            const color = meal.mealType?.color ?? DEFAULT_COLOR
            const widthPct = 100 / laneCount
            return (
              <button
                key={meal._id}
                type="button"
                disabled={!canEdit}
                onClick={() => onEditMeal?.(meal)}
                className={cn(
                  "group/meal pointer-events-auto absolute flex w-full min-w-0 flex-col items-start gap-0.5 overflow-hidden rounded-md border border-l-4 pr-2 pb-1 pl-3 text-left transition-shadow",
                  "pt-1.5",
                  canEdit ? "cursor-pointer hover:shadow-md" : "cursor-default",
                )}
                style={{
                  top: meal.startHour * ROW_H,
                  height: span * ROW_H - 2,
                  left: `calc(${lane * widthPct}% + ${lane === 0 ? 0 : 4}px)`,
                  width: `calc(${widthPct}% - 8px)`,
                  borderColor: `${color}55`,
                  borderLeftColor: color,
                  backgroundColor: `${color}1f`,
                }}
              >
                <span className="w-full truncate text-sm leading-snug font-semibold">
                  {meal.mealType?.name ?? "Meal"}
                </span>
                <span className="text-muted-foreground w-full truncate text-[11px] tabular-nums">
                  {formatRange(meal.startHour, end)}
                </span>
                {span >= 2 && meal.menuItems.length > 0 && (
                  <span className="text-muted-foreground line-clamp-2 w-full text-xs leading-snug">
                    {meal.menuItems.map((item) => item.title).join(", ")}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
