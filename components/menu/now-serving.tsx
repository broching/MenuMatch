"use client"

import Image from "next/image"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { UtensilsCrossed } from "lucide-react"

export type ShowcaseItem = {
  _id: string
  title: string
  description: string
  imageUrl: string | null
}

export type ShowcaseMeal = {
  _id: string
  startHour: number
  mealType: { name: string; color?: string } | null
  menuItems: ShowcaseItem[]
}

function formatHour(hour: number) {
  const period = hour < 12 ? "AM" : "PM"
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:00 ${period}`
}

// Position in the meal decides the set: 0 -> "SET A", 1 -> "SET B", ...
function setLabel(index: number) {
  return index < 26
    ? `SET ${String.fromCharCode(65 + index)}`
    : `SET ${index + 1}`
}

/**
 * Editorial "printed menu" showcase: the items of the currently-relevant meal
 * laid out side by side, like a restaurant set menu, with a staggered reveal.
 */
export function NowServing({
  meal,
  label,
  serifClass = "",
}: {
  meal: ShowcaseMeal
  label: string
  serifClass?: string
}) {
  const reduce = useReducedMotion()
  const accent = meal.mealType?.color ?? "#9f1239"

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  }

  const itemVariants: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.2 } },
      }
    : {
        hidden: { opacity: 0, y: 28, scale: 0.96 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.45, ease: "easeOut" },
        },
      }

  const headerVariants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: -12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
      }

  return (
    <motion.div
      key={meal._id}
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Eyebrow */}
      <motion.div
        variants={headerVariants}
        className="mb-6 flex flex-col items-center gap-2 text-center"
      >
        <span
          className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: accent }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          {label} · {formatHour(meal.startHour)}
        </span>
        <h2 className={`text-4xl font-semibold sm:text-5xl ${serifClass}`}>
          {meal.mealType?.name ?? "Menu"}
        </h2>
        <span
          className="mt-1 block h-px w-16"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </motion.div>

      {/* Side-by-side set columns */}
      <div className="flex flex-col lg:flex-row">
        {meal.menuItems.map((item, index) => (
          <motion.article
            key={item._id}
            variants={itemVariants}
            className="flex flex-1 basis-0 border-t border-dashed first:border-t-0 lg:border-t-0 lg:border-l lg:first:border-l-0"
          >
            {/* Continuous, gentle idle float (not hover-driven) */}
            <motion.div
              className="flex w-full flex-col items-center gap-4 px-6 py-8 text-center"
              animate={reduce ? undefined : { y: [0, -7, 0] }}
              transition={
                reduce
                  ? undefined
                  : {
                      duration: 3.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.4,
                    }
              }
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-xs font-semibold tracking-[0.2em] uppercase"
                  style={{ color: accent }}
                >
                  {setLabel(index)}
                </span>
                <h3 className={`text-2xl font-semibold ${serifClass}`}>
                  {item.title}
                </h3>
              </div>
              {item.description && (
                <p className="text-muted-foreground max-w-[28ch] text-sm leading-relaxed">
                  {item.description}
                </p>
              )}
              <div className="mt-auto w-full overflow-hidden rounded-xl shadow-sm">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="bg-muted flex aspect-[4/3] w-full items-center justify-center">
                    <UtensilsCrossed className="text-muted-foreground/50 size-10" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  )
}
