"use client"

import { useEffect, useState } from "react"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import { ArrowDown, ArrowUp, Loader2, Search, Trash2, X } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MealType = { _id: Id<"mealTypes">; name: string }
type MenuItem = { _id: Id<"menuItems">; title: string; mealTypeId: Id<"mealTypes"> }

export type ScheduledMealForEdit = {
  _id: Id<"scheduledMeals">
  startHour: number
  endHour?: number
  mealTypeId: Id<"mealTypes">
  menuItemIds: Id<"menuItems">[]
  note?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Position in the meal determines its set: 0 -> "SET A", 1 -> "SET B", ...
function setLabel(index: number) {
  return index < 26
    ? `SET ${String.fromCharCode(65 + index)}`
    : `SET ${index + 1}`
}

function formatHour(hour: number) {
  const period = hour < 12 ? "AM" : "PM"
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:00 ${period}`
}

// End-hour labels read as the moment the window closes (inclusive slot + 1).
function formatEndLabel(hour: number) {
  return formatHour((hour + 1) % 24)
}

export function ScheduledMealDialog({
  open,
  onOpenChange,
  date,
  defaultStartHour,
  defaultEndHour,
  mealTypes,
  menuItems,
  meal,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  defaultStartHour: number
  defaultEndHour: number
  mealTypes: MealType[]
  menuItems: MenuItem[]
  meal?: ScheduledMealForEdit | null
}) {
  const createMeal = useMutation(api.scheduledMeals.create)
  const updateMeal = useMutation(api.scheduledMeals.update)
  const removeMeal = useMutation(api.scheduledMeals.remove)

  const [mealTypeId, setMealTypeId] = useState<string>("")
  const [startHour, setStartHour] = useState<number>(defaultStartHour)
  const [endHour, setEndHour] = useState<number>(defaultEndHour)
  // Ordered: the array position is the set (A, B, C ...).
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  // "Add items" search + meal-type filter.
  const [itemSearch, setItemSearch] = useState("")
  const [itemFilterType, setItemFilterType] = useState<string>("all")

  const isEdit = !!meal

  useEffect(() => {
    if (open) {
      setMealTypeId(meal?.mealTypeId ?? mealTypes[0]?._id ?? "")
      setStartHour(meal?.startHour ?? defaultStartHour)
      setEndHour(meal?.endHour ?? meal?.startHour ?? defaultEndHour)
      setSelectedIds(meal?.menuItemIds ?? [])
      setItemSearch("")
      setItemFilterType("all")
    }
  }, [open, meal, defaultStartHour, defaultEndHour, mealTypes])

  // Keep the window valid: end can never precede start.
  const handleStartChange = (value: number) => {
    setStartHour(value)
    if (endHour < value) setEndHour(value)
  }

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  // Reorder a set up/down, which reassigns its SET letter.
  const moveItem = (index: number, dir: -1 | 1) => {
    setSelectedIds((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mealTypeId) return toast.error("Pick a meal type")
    setSubmitting(true)
    try {
      const menuItemIds = selectedIds as Id<"menuItems">[]
      if (isEdit && meal) {
        await updateMeal({
          id: meal._id,
          startHour,
          endHour,
          mealTypeId: mealTypeId as Id<"mealTypes">,
          menuItemIds,
        })
        toast.success("Meal updated")
      } else {
        await createMeal({
          date,
          startHour,
          endHour,
          mealTypeId: mealTypeId as Id<"mealTypes">,
          menuItemIds,
        })
        toast.success("Meal scheduled")
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!meal) return
    setSubmitting(true)
    try {
      await removeMeal({ id: meal._id })
      toast.success("Meal removed")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove")
    } finally {
      setSubmitting(false)
    }
  }

  // Surface items matching the chosen meal type first, but allow any.
  const sortedItems = [...menuItems].sort((a, b) => {
    const aMatch = a.mealTypeId === mealTypeId ? 0 : 1
    const bMatch = b.mealTypeId === mealTypeId ? 0 : 1
    return aMatch - bMatch || a.title.localeCompare(b.title)
  })

  const titleById = new Map<string, string>(
    menuItems.map((item) => [item._id, item.title]),
  )

  const query = itemSearch.trim().toLowerCase()
  const filteredItems = sortedItems.filter((item) => {
    const matchesSearch = !query || item.title.toLowerCase().includes(query)
    const matchesType =
      itemFilterType === "all" || item.mealTypeId === itemFilterType
    return matchesSearch && matchesType
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit meal" : "Schedule a meal"}</DialogTitle>
          <DialogDescription>
            {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="mealType">Meal type</Label>
            <Select value={mealTypeId} onValueChange={setMealTypeId}>
              <SelectTrigger id="mealType" className="w-full">
                <SelectValue placeholder="Meal type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((mt) => (
                  <SelectItem key={mt._id} value={mt._id}>
                    {mt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="start">From</Label>
              <Select
                value={String(startHour)}
                onValueChange={(v) => handleStartChange(Number(v))}
              >
                <SelectTrigger id="start" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {formatHour(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">Until</Label>
              <Select
                value={String(endHour)}
                onValueChange={(v) => setEndHour(Number(v))}
              >
                <SelectTrigger id="end" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.filter((h) => h >= startHour).map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {formatEndLabel(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {menuItems.length === 0 ? (
            <div className="grid gap-2">
              <Label>Menu items</Label>
              <p className="text-muted-foreground text-sm">
                No menu items yet. Add some on the Menu Items page first.
              </p>
            </div>
          ) : (
            <>
              {/* Ordered sets — position decides the SET letter */}
              <div className="grid gap-2">
                <Label>Sets (order = SET A, B, C…)</Label>
                {selectedIds.length === 0 ? (
                  <p className="text-muted-foreground rounded-md border border-dashed px-3 py-3 text-sm">
                    Select items below to build this meal's sets.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {selectedIds.map((id, index) => (
                      <div
                        key={id}
                        className="bg-muted/40 flex items-center gap-2 rounded-md border px-2 py-1.5"
                      >
                        <span className="text-primary bg-primary/10 rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                          {setLabel(index)}
                        </span>
                        <span className="flex-1 truncate text-sm">
                          {titleById.get(id) ?? "Unknown item"}
                        </span>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            disabled={index === 0}
                            onClick={() => moveItem(index, -1)}
                            aria-label="Move up"
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            disabled={index === selectedIds.length - 1}
                            onClick={() => moveItem(index, 1)}
                            aria-label="Move down"
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive size-7"
                            onClick={() => toggleItem(id)}
                            aria-label="Remove"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pick which items are on the menu */}
              <div className="grid gap-2">
                <Label>Add items</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                    <Input
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Search items…"
                      className="pl-8"
                    />
                  </div>
                  <Select value={itemFilterType} onValueChange={setItemFilterType}>
                    <SelectTrigger className="sm:w-44">
                      <SelectValue placeholder="All meal types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All meal types</SelectItem>
                      {mealTypes.map((mt) => (
                        <SelectItem key={mt._id} value={mt._id}>
                          {mt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="max-h-44 overflow-y-auto rounded-md border p-1">
                  {filteredItems.length === 0 ? (
                    <p className="text-muted-foreground px-2 py-3 text-sm">
                      No items match your search.
                    </p>
                  ) : (
                    filteredItems.map((item) => (
                      <label
                        key={item._id}
                        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                      >
                        <Checkbox
                          checked={selectedIds.includes(item._id)}
                          onCheckedChange={() => toggleItem(item._id)}
                        />
                        <span>{item.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          <DialogFooter className="sm:justify-between">
            {isEdit ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={submitting}
              >
                <Trash2 className="mr-1 size-4" />
                Remove
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEdit ? "Save" : "Schedule"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
