"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { IconPlus } from "@tabler/icons-react"
import { Loader2, Trash2 } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const DEFAULT_COLOR = "#6366f1"

export default function MealTypesPage() {
  const mealTypes = useQuery(api.mealTypes.list)
  const createMealType = useMutation(api.mealTypes.create)
  const updateMealType = useMutation(api.mealTypes.update)
  const removeMealType = useMutation(api.mealTypes.remove)

  const [name, setName] = useState("")
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error("Name is required")
    setSubmitting(true)
    try {
      await createMealType({ name: name.trim(), color })
      setName("")
      setColor(DEFAULT_COLOR)
      toast.success("Meal type added")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add")
    } finally {
      setSubmitting(false)
    }
  }

  const handleColorChange = async (id: Id<"mealTypes">, value: string) => {
    try {
      await updateMealType({ id, color: value })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    }
  }

  const handleDelete = async (id: Id<"mealTypes">) => {
    try {
      await removeMealType({ id })
      toast.success("Meal type deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4 px-4 lg:px-6">
      <div>
        <h2 className="text-xl font-semibold">Meal Types</h2>
        <p className="text-muted-foreground text-sm">
          Categories like Breakfast, Lunch, Dinner, or a custom Tea Break.
        </p>
      </div>

      <Card>
        <CardContent>
          <form
            onSubmit={handleCreate}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="grid min-w-[12rem] flex-1 gap-2">
              <Label htmlFor="name">New meal type</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tea Break"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="border-input h-9 w-12 cursor-pointer rounded-md border"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <IconPlus className="size-4" />
              )}
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {mealTypes === undefined ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {mealTypes.map((mt) => (
            <Card key={mt._id}>
              <CardContent className="flex items-center gap-3 py-3">
                <input
                  type="color"
                  value={mt.color ?? DEFAULT_COLOR}
                  onChange={(e) => handleColorChange(mt._id, e.target.value)}
                  className="border-input size-7 cursor-pointer rounded-md border"
                  aria-label={`Color for ${mt.name}`}
                />
                <span className="flex-1 font-medium">{mt.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(mt._id)}
                  aria-label={`Delete ${mt.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
