"use client"

import { useMemo, useState } from "react"
import { useQuery } from "convex/react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { DayCalendar, type CalendarMeal } from "@/components/menu/day-calendar"
import { MonthCalendar } from "@/components/menu/month-calendar"
import {
  ScheduledMealDialog,
  type ScheduledMealForEdit,
} from "@/components/menu/scheduled-meal-dialog"

// Format a Date as a local "YYYY-MM-DD" string (matches stored meal dates).
function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

type View = "day" | "month"

export default function CalendarPage() {
  const [view, setView] = useState<View>("day")
  const [current, setCurrent] = useState(() => new Date())
  const dateKey = toDateKey(current)

  const monthRange = useMemo(() => {
    const y = current.getFullYear()
    const m = current.getMonth()
    return {
      startDate: toDateKey(new Date(y, m, 1)),
      endDate: toDateKey(new Date(y, m + 1, 0)),
    }
  }, [current])

  // Only run the query for the active view.
  const dayMeals = useQuery(
    api.scheduledMeals.listByDate,
    view === "day" ? { date: dateKey } : "skip",
  )
  const monthMeals = useQuery(
    api.scheduledMeals.listByDateRange,
    view === "month" ? monthRange : "skip",
  )
  const mealTypes = useQuery(api.mealTypes.list)
  const menuItems = useQuery(api.menuItems.list)

  const mealsByDate = useMemo(() => {
    const map = new Map<string, CalendarMeal[]>()
    monthMeals?.forEach((meal) => {
      const list = map.get(meal.date) ?? []
      list.push(meal)
      map.set(meal.date, list)
    })
    return map
  }, [monthMeals])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDate, setDialogDate] = useState(dateKey)
  const [defaultRange, setDefaultRange] = useState({ start: 8, end: 8 })
  const [editing, setEditing] = useState<ScheduledMealForEdit | null>(null)

  const shift = (delta: number) => {
    setCurrent((prev) => {
      const next = new Date(prev)
      if (view === "day") next.setDate(next.getDate() + delta)
      else next.setMonth(next.getMonth() + delta)
      return next
    })
  }

  const openRange = (start: number, end: number) => {
    setEditing(null)
    setDialogDate(dateKey)
    setDefaultRange({ start, end })
    setDialogOpen(true)
  }

  const openEdit = (meal: CalendarMeal) => {
    setEditing({
      _id: meal._id as ScheduledMealForEdit["_id"],
      startHour: meal.startHour,
      endHour: meal.endHour,
      mealTypeId: meal.mealType?._id as ScheduledMealForEdit["mealTypeId"],
      menuItemIds: meal.menuItems.map(
        (item) => item._id,
      ) as ScheduledMealForEdit["menuItemIds"],
      note: meal.note,
    })
    setDialogDate(dateKey)
    setDefaultRange({ start: meal.startHour, end: meal.endHour ?? meal.startHour })
    setDialogOpen(true)
  }

  // Quick-add a meal on a specific day straight from the month view.
  const openAddDay = (key: string) => {
    setEditing(null)
    setDialogDate(key)
    setDefaultRange({ start: 8, end: 8 })
    setDialogOpen(true)
  }

  const selectDay = (key: string) => {
    setCurrent(new Date(`${key}T00:00:00`))
    setView("day")
  }

  const dayLoading =
    dayMeals === undefined || mealTypes === undefined || menuItems === undefined

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Calendar</h2>
          <p className="text-muted-foreground text-sm">
            {view === "day"
              ? "Place meals on the day's 24-hour schedule."
              : "Overview of every day's scheduled meals."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted flex rounded-md p-0.5">
            <Button
              variant={view === "day" ? "default" : "ghost"}
              size="sm"
              className="h-7"
              onClick={() => setView("day")}
            >
              Day
            </Button>
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              className="h-7"
              onClick={() => setView("month")}
            >
              Month
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrent(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="text-base font-medium">
        {view === "day"
          ? current.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : current.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
            })}
      </div>

      {view === "day" ? (
        dayLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-muted-foreground -mt-2 text-xs">
              Tip: click an hour to add a meal, or drag across hours to set a
              window (e.g. lunch 12–3pm).
            </p>
            <DayCalendar
              meals={dayMeals}
              onSelectRange={openRange}
              onEditMeal={openEdit}
            />
          </>
        )
      ) : monthMeals === undefined ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : (
        <MonthCalendar
          year={current.getFullYear()}
          month={current.getMonth()}
          mealsByDate={mealsByDate}
          todayKey={toDateKey(new Date())}
          onSelectDay={selectDay}
          onAddDay={openAddDay}
        />
      )}

      <ScheduledMealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={dialogDate}
        defaultStartHour={defaultRange.start}
        defaultEndHour={defaultRange.end}
        mealTypes={mealTypes ?? []}
        menuItems={menuItems ?? []}
        meal={editing}
      />
    </div>
  )
}
