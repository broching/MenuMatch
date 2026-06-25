"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MealType = { _id: Id<"mealTypes">; name: string }

export type MenuItemForEdit = {
  _id: Id<"menuItems">
  title: string
  description: string
  mealTypeId: Id<"mealTypes">
  imageUrl: string | null
}

export function MenuItemFormDialog({
  open,
  onOpenChange,
  mealTypes,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealTypes: MealType[]
  item?: MenuItemForEdit | null
}) {
  const createItem = useMutation(api.menuItems.create)
  const updateItem = useMutation(api.menuItems.update)
  const generateUploadUrl = useMutation(api.menuItems.generateUploadUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [mealTypeId, setMealTypeId] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isEdit = !!item

  // Reset the form whenever the dialog opens for a new/edited item.
  useEffect(() => {
    if (open) {
      setTitle(item?.title ?? "")
      setDescription(item?.description ?? "")
      setMealTypeId(item?.mealTypeId ?? mealTypes[0]?._id ?? "")
      setFile(null)
      setPreviewUrl(item?.imageUrl ?? null)
      setRemoveImage(false)
    }
  }, [open, item, mealTypes])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setRemoveImage(false)
    if (selected) setPreviewUrl(URL.createObjectURL(selected))
  }

  const clearImage = () => {
    setFile(null)
    setPreviewUrl(null)
    setRemoveImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return toast.error("Title is required")
    if (!mealTypeId) return toast.error("Please pick a meal type")

    setSubmitting(true)
    try {
      // Upload a newly selected image to Convex storage first.
      let imageStorageId: Id<"_storage"> | undefined
      if (file) {
        const uploadUrl = await generateUploadUrl()
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        if (!res.ok) throw new Error("Image upload failed")
        const { storageId } = (await res.json()) as { storageId: Id<"_storage"> }
        imageStorageId = storageId
      }

      if (isEdit && item) {
        await updateItem({
          id: item._id,
          title: title.trim(),
          description: description.trim(),
          mealTypeId: mealTypeId as Id<"mealTypes">,
          // null clears, undefined leaves unchanged, a new id replaces.
          imageStorageId: imageStorageId ?? (removeImage ? null : undefined),
        })
        toast.success("Menu item updated")
      } else {
        await createItem({
          title: title.trim(),
          description: description.trim(),
          mealTypeId: mealTypeId as Id<"mealTypes">,
          imageStorageId,
        })
        toast.success("Menu item created")
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit menu item" : "Add menu item"}</DialogTitle>
          <DialogDescription>
            A food option with a title, description, meal type, and optional image.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Buttermilk Pancakes"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of this dish"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mealType">Meal type</Label>
            <Select value={mealTypeId} onValueChange={setMealTypeId}>
              <SelectTrigger id="mealType" className="w-full">
                <SelectValue placeholder="Select a meal type" />
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

          <div className="grid gap-2">
            <Label>Image (optional)</Label>
            {previewUrl ? (
              <div className="relative w-full overflow-hidden rounded-md border">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={400}
                  height={225}
                  unoptimized
                  className="h-40 w-full object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 size-7"
                  onClick={clearImage}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-24 border-dashed"
              >
                <Upload className="mr-2 size-4" />
                Upload image
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <DialogFooter>
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
              {isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
