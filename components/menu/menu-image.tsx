"use client"

import Image from "next/image"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * next/image wrapper that shows a loading spinner over a muted backdrop while
 * the image downloads, then fades the image in once it's ready. Only render
 * this when an image URL is actually available.
 */
export function MenuImage({
  src,
  alt,
  width,
  height,
  className,
  imgClassName,
  unoptimized,
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  imgClassName?: string
  unoptimized?: boolean
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={cn("bg-muted relative overflow-hidden", className)}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="text-muted-foreground/50 size-6 animate-spin" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized={unoptimized}
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative z-10 transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  )
}
