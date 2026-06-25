import { cn } from "@/lib/utils"

const SETS = [
  { label: "SET A", title: "Buttermilk Pancakes" },
  { label: "SET B", title: "Garden Waffles" },
  { label: "SET C", title: "Soft Eggs & Greens" },
]

const TIMELINE = [
  { time: "8:00", name: "Breakfast", color: "var(--color-chart-3)", now: false },
  { time: "12:00", name: "Lunch", color: "var(--color-chart-2)", now: true },
  { time: "15:00", name: "Tea Break", color: "var(--color-chart-1)", now: false },
  { time: "19:00", name: "Dinner", color: "var(--color-chart-5)", now: false },
]

/**
 * A faithful, static mock of the live public menu — the "now serving" card with
 * SET A/B/C plus a slim day timeline. Mirrors the real product UI.
 */
export function MenuPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-card ring-border/60 w-full overflow-hidden rounded-[var(--radius)] border shadow-xl ring-1",
        className,
      )}
    >
      {/* Window chrome */}
      <div className="border-border flex items-center gap-2 border-b px-4 py-3">
        <span className="bg-chart-1 size-2.5 rounded-full" />
        <span className="bg-chart-3 size-2.5 rounded-full" />
        <span className="bg-chart-2 size-2.5 rounded-full" />
        <span className="text-muted-foreground ml-3 text-xs tabular-nums">
          menumatch.app/menu/sunroom-cafe
        </span>
      </div>

      <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
        {/* Now serving */}
        <div className="p-6">
          <p className="text-primary text-[11px] font-semibold tracking-[0.2em] uppercase">
            Now serving · 12:00 PM
          </p>
          <h3 className="mt-1 text-2xl font-semibold">Lunch</h3>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {SETS.map((s) => (
              <div key={s.label} className="flex flex-col gap-2">
                <div className="bg-secondary aspect-square w-full rounded-lg" />
                <span className="text-primary text-[10px] font-semibold tracking-[0.15em] uppercase">
                  {s.label}
                </span>
                <span className="text-xs leading-snug font-medium">
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Day timeline */}
        <div className="border-border bg-muted/40 flex flex-col gap-2 border-t p-5 sm:w-44 sm:border-t-0 sm:border-l">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            Today
          </p>
          {TIMELINE.map((t) => (
            <div
              key={t.time}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                t.now && "bg-card shadow-sm",
              )}
            >
              <span className="text-muted-foreground w-10 shrink-0 tabular-nums">
                {t.time}
              </span>
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <span className={cn("truncate", t.now && "font-semibold")}>
                {t.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
