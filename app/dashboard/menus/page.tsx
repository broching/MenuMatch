"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { IconPlus, IconToolsKitchen2 } from "@tabler/icons-react"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Search,
  Trash2,
} from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MenuItemFormDialog,
  type MenuItemForEdit,
} from "@/components/menu/menu-item-form-dialog"
import { MenuImage } from "@/components/menu/menu-image"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8

export default function MenusPage() {
  const menuItems = useQuery(api.menuItems.list)
  const mealTypes = useQuery(api.mealTypes.list)
  const removeItem = useMutation(api.menuItems.remove)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItemForEdit | null>(null)

  // Filter / sort / pagination state
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sort, setSort] = useState<"latest" | "oldest">("latest")
  const [page, setPage] = useState(1)

  // Reset to page 1 whenever the filters change.
  useEffect(() => {
    setPage(1)
  }, [search, filterType, sort])

  const mealTypeName = useMemo(() => {
    const map = new Map<string, string>()
    mealTypes?.forEach((mt) => map.set(mt._id, mt.name))
    return map
  }, [mealTypes])

  const processed = useMemo(() => {
    if (!menuItems) return []
    const q = search.trim().toLowerCase()
    return menuItems
      .filter((item) => {
        const matchesSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        const matchesType =
          filterType === "all" || item.mealTypeId === filterType
        return matchesSearch && matchesType
      })
      .sort((a, b) =>
        sort === "latest"
          ? b._creationTime - a._creationTime
          : a._creationTime - b._creationTime,
      )
  }, [menuItems, search, filterType, sort])

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = processed.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const loading = menuItems === undefined || mealTypes === undefined
  const noMealTypes = mealTypes !== undefined && mealTypes.length === 0
  const hasItems = !!menuItems && menuItems.length > 0

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

      {/* Filter / search / sort toolbar */}
      {hasItems && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items…"
              className="pl-8"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="All meal types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All meal types</SelectItem>
              {mealTypes?.map((mt) => (
                <SelectItem key={mt._id} value={mt._id}>
                  {mt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as "latest" | "oldest")}
          >
            <SelectTrigger className="sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      ) : processed.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-muted-foreground py-16 text-center text-sm">
            No items match your search.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((item) => (
              <Card key={item._id} className="overflow-hidden pt-0">
                {item.imageUrl ? (
                  <MenuImage
                    src={item.imageUrl}
                    alt={item.title}
                    width={400}
                    height={225}
                    className="h-40 w-full"
                    imgClassName="h-40 w-full object-cover"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={n === currentPage ? "default" : "outline"}
                  size="icon"
                  className={cn("tabular-nums", n === currentPage && "pointer-events-none")}
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === currentPage ? "page" : undefined}
                >
                  {n}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
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
