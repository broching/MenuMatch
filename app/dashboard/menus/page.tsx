"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { IconPlus, IconToolsKitchen2 } from "@tabler/icons-react"
import { Loader2, Pencil, Trash2 } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MenuItemFormDialog,
  type MenuItemForEdit,
} from "@/components/menu/menu-item-form-dialog"

export default function MenusPage() {
  const menuItems = useQuery(api.menuItems.list)
  const mealTypes = useQuery(api.mealTypes.list)
  const removeItem = useMutation(api.menuItems.remove)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItemForEdit | null>(null)

  const mealTypeName = useMemo(() => {
    const map = new Map<string, string>()
    mealTypes?.forEach((mt) => map.set(mt._id, mt.name))
    return map
  }, [mealTypes])

  const loading = menuItems === undefined || mealTypes === undefined

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (item: MenuItemForEdit) => {
    setEditing(item)
    setDialogOpen(true)
  }

  const handleDelete = async (id: Id<"menuItems">) => {
    try {
      await removeItem({ id })
      toast.success("Menu item deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const noMealTypes = mealTypes !== undefined && mealTypes.length === 0

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Menu Items</h2>
          <p className="text-muted-foreground text-sm">
            Your library of food options.
          </p>
        </div>
        <Button onClick={openCreate} disabled={noMealTypes}>
          <IconPlus className="mr-1 size-4" />
          Add item
        </Button>
      </div>

      {noMealTypes && (
        <Card>
          <CardContent className="text-muted-foreground py-4 text-sm">
            Create at least one meal type first on the{" "}
            <a href="/dashboard/meal-types" className="text-primary underline">
              Meal Types
            </a>{" "}
            page.
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : menuItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <IconToolsKitchen2 className="text-muted-foreground size-10" />
            <div>
              <p className="font-medium">No menu items yet</p>
              <p className="text-muted-foreground text-sm">
                Add your first food option to get started.
              </p>
            </div>
            <Button onClick={openCreate} disabled={noMealTypes}>
              <IconPlus className="mr-1 size-4" />
              Add item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menuItems.map((item) => (
            <Card key={item._id} className="overflow-hidden pt-0">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={400}
                  height={225}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="bg-muted flex h-40 w-full items-center justify-center">
                  <IconToolsKitchen2 className="text-muted-foreground size-8" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {mealTypeName.get(item.mealTypeId) ?? "—"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {item.description && (
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {item.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      openEdit({
                        _id: item._id,
                        title: item.title,
                        description: item.description,
                        mealTypeId: item.mealTypeId,
                        imageUrl: item.imageUrl,
                      })
                    }
                  >
                    <Pencil className="mr-1 size-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="mr-1 size-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MenuItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mealTypes={mealTypes ?? []}
        item={editing}
      />
    </div>
  )
}
