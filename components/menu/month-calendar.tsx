"use client"

import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalendarMeal } from "@/components/menu/day-calendar"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MAX_CHIPS = 3

function dateKey(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, "0")
  const d = String(day).padStart(2, "0")
  return `${year}-${m}-${d}`
}

export function MonthCalendar({
  year,
  month,
  mealsByDate,
  todayKey,
  onSelectDay,
  onAddDay,
}: {
  year: number
  month: number // 0-11
  mealsByDate: Map<string, CalendarMeal[]>
  todayKey?: string
  onSelectDay?: (dateKey: string) => void
  // When provided, each day shows a "+" to schedule a meal on that date.
  onAddDay?: (dateKey: string) => void
}) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build a 6-row grid of cells; leading/trailing nulls pad the weeks.
  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-muted-foreground bg-muted/30 px-2 py-2 text-center text-xs font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="bg-muted/10 min-h-24 border-r border-b last:border-r-0"
              />
            )
          }
          const key = dateKey(year, month, day)
          const meals = mealsByDate.get(key) ?? []
          const isToday = key === todayKey
          const isInteractive = !!onSelectDay

          return (
            <div
              key={key}
              role={isInteractive ? "button" : undefined}
              tabIndex={isInteractive ? 0 : undefined}
              onClick={isInteractive ? () => onSelectDay?.(key) : undefined}
              onKeyDown={
                isInteractive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onSelectDay?.(key)
                      }
                    }
                  : undefined
              }
              className={cn(
                "group/day relative min-h-24 border-r border-b p-1.5 text-left align-top last:border-r-0",
                "[&:nth-child(7n)]:border-r-0",
                isInteractive && "hover:bg-accent cursor-pointer transition-colors",
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                {onAddDay ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddDay(key)
                    }}
                    aria-label={`Add a meal on ${key}`}
                    className="text-muted-foreground hover:bg-primary hover:text-primary-foreground flex size-6 items-center justify-center rounded-md opacity-0 transition-all focus-visible:opacity-100 group-hover/day:opacity-100"
                  >
                    <Plus className="size-4" />
                  </button>
                ) : (
                  <span />
                )}
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs",
                    isToday
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  {day}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {meals.slice(0, MAX_CHIPS).map((meal) => (
                  <span
                    key={meal._id}
                    className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] leading-tight"
                    style={{
                      backgroundColor: `${meal.mealType?.color ?? "#6366f1"}1f`,
                    }}
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: meal.mealType?.color ?? "#6366f1" }}
                    />
                    <span className="truncate">{meal.mealType?.name ?? "Meal"}</span>
                  </span>
                ))}
                {meals.length > MAX_CHIPS && (
                  <span className="text-muted-foreground px-1 text-[11px]">
                    +{meals.length - MAX_CHIPS} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
