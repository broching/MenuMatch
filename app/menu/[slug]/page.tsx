"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Playfair_Display } from "next/font/google"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  LocateFixed,
  Loader2,
  UtensilsCrossed,
} from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DayCalendar, type CalendarMeal } from "@/components/menu/day-calendar"
import { MonthCalendar } from "@/components/menu/month-calendar"
import { NowServing } from "@/components/menu/now-serving"

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
})

function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatHour(hour: number) {
  const period = hour < 12 ? "AM" : "PM"
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:00 ${period}`
}

type View = "day" | "month"

export default function PublicMenuPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const [now, setNow] = useState(() => new Date())
  // Hero selection: null = follow the live current time.
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null)

  // Calendar dialog (browsing) state, independent of the hero.
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calView, setCalView] = useState<View>("day")
  const [calCurrent, setCalCurrent] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const todayKey = toDateKey(now)
  const viewingKey = selectedDate ?? todayKey
  const isNow = selectedDate === null && selectedMealId === null

  const org = useQuery(api.organizations.getBySlug, { slug })
  const todayMeals = useQuery(api.scheduledMeals.listPublicByDate, {
    slug,
    date: todayKey,
  })
  // Meals for a featured non-today date.
  const otherDateMeals = useQuery(
    api.scheduledMeals.listPublicByDate,
    selectedDate && selectedDate !== todayKey
      ? { slug, date: selectedDate }
      : "skip",
  )
  const featuredMeals =
    selectedDate && selectedDate !== todayKey ? otherDateMeals : todayMeals

  // Calendar dialog queries (only the active view runs).
  const calDateKey = toDateKey(calCurrent)
  const calMonthRange = useMemo(() => {
    const y = calCurrent.getFullYear()
    const m = calCurrent.getMonth()
    return {
      startDate: toDateKey(new Date(y, m, 1)),
      endDate: toDateKey(new Date(y, m + 1, 0)),
    }
  }, [calCurrent])
  const calDayMeals = useQuery(
    api.scheduledMeals.listPublicByDate,
    calendarOpen && calView === "day" ? { slug, date: calDateKey } : "skip",
  )
  const calMonthMeals = useQuery(
    api.scheduledMeals.listPublicByDateRange,
    calendarOpen && calView === "month" ? { slug, ...calMonthRange } : "skip",
  )
  const calMealsByDate = useMemo(() => {
    const map = new Map<string, CalendarMeal[]>()
    calMonthMeals?.forEach((meal) => {
      const list = map.get(meal.date) ?? []
      list.push(meal)
      map.set(meal.date, list)
    })
    return map
  }, [calMonthMeals])

  // Resolve the meal shown in the hero + its contextual label.
  const { heroMeal, heroLabel, upNext } = useMemo(() => {
    if (!featuredMeals || featuredMeals.length === 0) {
      return { heroMeal: null, heroLabel: "", upNext: null }
    }
    const isToday = viewingKey === todayKey
    const nowHour = now.getHours()

    if (selectedMealId) {
      const picked = featuredMeals.find((m) => m._id === selectedMealId)
      if (picked) {
        let label: string
        if (!isToday) {
          label = new Date(`${viewingKey}T00:00:00`).toLocaleDateString(
            undefined,
            { weekday: "short", month: "short", day: "numeric" },
          )
        } else if ((picked.endHour ?? picked.startHour) < nowHour) {
          label = "Earlier Today"
        } else if (picked.startHour > nowHour) {
          label = "Up Next"
        } else {
          label = "Now Serving"
        }
        return { heroMeal: picked, heroLabel: label, upNext: null }
      }
    }

    if (isToday) {
      const started = featuredMeals.filter(
        (m) => m.startHour <= nowHour && (m.endHour ?? m.startHour) >= nowHour,
      )
      const active =
        started.length > 0
          ? started[started.length - 1]
          : featuredMeals.filter((m) => m.startHour <= nowHour).at(-1) ?? null
      const upcoming = featuredMeals.find((m) => m.startHour > nowHour) ?? null
      const isActiveNow =
        active != null &&
        active.startHour <= nowHour &&
        (active.endHour ?? active.startHour) >= nowHour
      return {
        heroMeal: active ?? upcoming,
        heroLabel: active ? (isActiveNow ? "Now Serving" : "Earlier Today") : "Up Next",
        upNext: isActiveNow ? upcoming : null,
      }
    }

    // A featured non-today date: show its first meal.
    const dateLabel = new Date(`${viewingKey}T00:00:00`).toLocaleDateString(
      undefined,
      { weekday: "short", month: "short", day: "numeric" },
    )
    return { heroMeal: featuredMeals[0], heroLabel: dateLabel, upNext: null }
  }, [featuredMeals, selectedMealId, viewingKey, todayKey, now])

  const returnToNow = () => {
    setSelectedDate(null)
    setSelectedMealId(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openCalendar = () => {
    setCalView("day")
    setCalCurrent(new Date(`${viewingKey}T00:00:00`))
    setCalendarOpen(true)
  }

  const shiftCal = (delta: number) => {
    setCalCurrent((prev) => {
      const next = new Date(prev)
      if (calView === "day") next.setDate(next.getDate() + delta)
      else next.setMonth(next.getMonth() + delta)
      return next
    })
  }

  // Drill from month → that day's day view.
  const drillToDay = (key: string) => {
    setCalCurrent(new Date(`${key}T00:00:00`))
    setCalView("day")
  }

  // Feature a specific meal (with its time) from the calendar.
  const featureMeal = (meal: CalendarMeal) => {
    setSelectedDate(calDateKey)
    setSelectedMealId(meal._id)
    setCalendarOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Feature the whole day currently shown in the calendar.
  const featureDay = () => {
    setSelectedDate(calDateKey)
    setSelectedMealId(null)
    setCalendarOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (org === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    )
  }

  if (org === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
        <UtensilsCrossed className="text-muted-foreground size-10" />
        <h1 className="text-2xl font-semibold">Menu not found</h1>
        <p className="text-muted-foreground">
          No organization exists at <span className="font-mono">/menu/{slug}</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="from-background to-muted/40 min-h-dvh bg-gradient-to-b">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center gap-4">
          {org.imageUrl ? (
            <Image
              src={org.imageUrl}
              alt={org.name}
              width={56}
              height={56}
              unoptimized
              className="size-14 rounded-lg object-cover"
            />
          ) : (
            <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-lg">
              <UtensilsCrossed className="size-7" />
            </div>
          )}
          <div className="flex-1">
            <h1 className={`text-2xl font-bold sm:text-3xl ${serif.className}`}>
              {org.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm tabular-nums">
              <Clock className="size-3.5" />
              {now.toLocaleString(undefined, {
                weekday: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isNow ? "outline" : "default"}
              size="sm"
              onClick={returnToNow}
            >
              <LocateFixed className="mr-1 size-4" />
              Now
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={openCalendar}
              aria-label="Open calendar"
            >
              <CalendarDays className="size-4" />
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section>
          {featuredMeals === undefined ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="text-muted-foreground size-7 animate-spin" />
            </div>
          ) : heroMeal ? (
            <div className="bg-card/60 rounded-2xl border px-4 py-10 shadow-sm backdrop-blur-sm sm:px-10 sm:py-14">
              <NowServing
                meal={heroMeal}
                label={heroLabel}
                serifClass={serif.className}
              />
              {upNext && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(null)
                      setSelectedMealId(upNext._id)
                    }}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors"
                  >
                    Up next ·{" "}
                    <span className="text-foreground font-medium">
                      {upNext.mealType?.name ?? "Meal"}
                    </span>{" "}
                    at {formatHour(upNext.startHour)}
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="text-muted-foreground py-16 text-center">
                <UtensilsCrossed className="mx-auto mb-3 size-8 opacity-50" />
                {isNow
                  ? "No meals scheduled for today."
                  : "No meals scheduled for this day."}
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={openCalendar}>
                    <CalendarDays className="mr-1 size-4" />
                    Browse the calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* Calendar browse dialog */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className={serif.className}>
              Browse the menu
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="bg-muted flex rounded-md p-0.5">
              <Button
                variant={calView === "day" ? "default" : "ghost"}
                size="sm"
                className="h-7"
                onClick={() => setCalView("day")}
              >
                Day
              </Button>
              <Button
                variant={calView === "month" ? "default" : "ghost"}
                size="sm"
                className="h-7"
                onClick={() => setCalView("month")}
              >
                Month
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => shiftCal(-1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-40 text-center text-sm font-medium">
                {calView === "day"
                  ? calCurrent.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : calCurrent.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })}
              </span>
              <Button variant="outline" size="icon" onClick={() => shiftCal(1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {calView === "day" ? (
              calDayMeals === undefined ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="text-muted-foreground size-7 animate-spin" />
                </div>
              ) : (
                <DayCalendar
                  meals={calDayMeals}
                  onEditMeal={featureMeal}
                  highlightHour={
                    calDateKey === todayKey ? now.getHours() : null
                  }
                />
              )
            ) : calMonthMeals === undefined ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="text-muted-foreground size-7 animate-spin" />
              </div>
            ) : (
              <MonthCalendar
                year={calCurrent.getFullYear()}
                month={calCurrent.getMonth()}
                mealsByDate={calMealsByDate}
                todayKey={todayKey}
                onSelectDay={drillToDay}
              />
            )}
          </div>

          {calView === "day" && (
            <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
              <span>Tap a meal to jump to it.</span>
              <Button variant="outline" size="sm" onClick={featureDay}>
                Show this day
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
