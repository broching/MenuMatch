"use client"

import Link from "next/link"
import { useOrganization } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import {
  IconCalendarEvent,
  IconListDetails,
  IconToolsKitchen2,
} from "@tabler/icons-react"
import { ExternalLink, Loader2, Plus } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

export default function DashboardPage() {
  const { organization } = useOrganization()

  const today = new Date()
  const todayKey = toDateKey(today)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const menuItems = useQuery(api.menuItems.list)
  const mealTypes = useQuery(api.mealTypes.list)
  const todayMeals = useQuery(api.scheduledMeals.listByDate, { date: todayKey })
  const weekMeals = useQuery(api.scheduledMeals.listByDateRange, {
    startDate: todayKey,
    endDate: toDateKey(weekEnd),
  })

  const stats = [
    {
      label: "Menu Items",
      value: menuItems?.length,
      icon: IconToolsKitchen2,
      href: "/dashboard/menus",
    },
    {
      label: "Meal Types",
      value: mealTypes?.length,
      icon: IconListDetails,
      href: "/dashboard/meal-types",
    },
    {
      label: "Scheduled Today",
      value: todayMeals?.length,
      icon: IconCalendarEvent,
      href: "/dashboard/calendar",
    },
    {
      label: "Next 7 Days",
      value: weekMeals?.length,
      icon: IconCalendarEvent,
      href: "/dashboard/calendar",
    },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            {organization?.name ?? "Dashboard"}
          </h2>
          <p className="text-muted-foreground text-sm">
            Your menu and scheduling overview.
          </p>
        </div>
        {organization?.slug && (
          <Button variant="outline" asChild>
            <Link href={`/menu/${organization.slug}`} target="_blank">
              <ExternalLink className="mr-1 size-4" />
              View public page
            </Link>
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-accent/40 h-full transition-colors">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <stat.icon className="text-muted-foreground size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tabular-nums">
                  {stat.value ?? (
                    <Loader2 className="text-muted-foreground size-6 animate-spin" />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today's schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's schedule</CardTitle>
            <CardDescription>
              {today.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayMeals === undefined ? (
              <div className="flex justify-center py-8">
                <Loader2 className="text-muted-foreground size-6 animate-spin" />
              </div>
            ) : todayMeals.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Nothing scheduled for today yet.
                </p>
                <Button asChild size="sm">
                  <Link href="/dashboard/calendar">
                    <Plus className="mr-1 size-4" />
                    Schedule a meal
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {todayMeals.map((meal) => (
                  <div
                    key={meal._id}
                    className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2"
                    style={{
                      borderLeftColor: meal.mealType?.color ?? "#6366f1",
                      backgroundColor: `${meal.mealType?.color ?? "#6366f1"}14`,
                    }}
                  >
                    <span className="text-muted-foreground w-20 shrink-0 text-xs tabular-nums">
                      {formatHour(meal.startHour)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">
                        {meal.mealType?.name ?? "Meal"}
                      </div>
                      {meal.menuItems.length > 0 && (
                        <div className="text-muted-foreground truncate text-xs">
                          {meal.menuItems.map((item) => item.title).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/menus">
                <IconToolsKitchen2 className="mr-1 size-4" />
                Manage menu items
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/calendar">
                <IconCalendarEvent className="mr-1 size-4" />
                Open calendar
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/meal-types">
                <IconListDetails className="mr-1 size-4" />
                Edit meal types
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
