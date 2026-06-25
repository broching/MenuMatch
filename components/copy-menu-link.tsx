"use client"

import { useState } from "react"
import { useOrganization } from "@clerk/nextjs"
import { Check, Link2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Copies the active organization's public menu URL (/menu/<slug>) to the
 * clipboard so admins can share it with guests. Renders nothing until an
 * organization with a slug is active.
 */
export function CopyMenuLink({
  variant = "outline",
  size = "sm",
  className,
  label = "Copy menu link",
}: {
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
  label?: string
}) {
  const { organization } = useOrganization()
  const [copied, setCopied] = useState(false)

  if (!organization?.slug) return null

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/menu/${organization.slug}`
      : `/menu/${organization.slug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Menu link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't copy — please copy it manually")
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(className)}
      aria-label="Copy public menu link"
    >
      {copied ? (
        <Check className="size-4" />
      ) : (
        <Link2 className="size-4" />
      )}
      {copied ? "Copied" : label}
    </Button>
  )
}
