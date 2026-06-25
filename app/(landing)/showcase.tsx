"use client"

import { Reveal } from "./reveal"
import { MenuPreview } from "./menu-preview"
import { Check } from "lucide-react"

const POINTS = [
  "Opens on the current meal, automatically",
  "Sets laid out side by side, just like a printed menu",
  "Browse any day or month, then jump back to now",
]

export default function Showcase() {
  return (
    <section id="showcase" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
              The public menu
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              A menu that greets guests with what's on now.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              No PDFs, no out-of-date specials. Your guests open one link and see
              exactly what's being served this moment — beautifully laid out.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <ul className="mt-8 flex flex-col gap-3">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="bg-secondary text-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-foreground/90">{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={32}>
          <MenuPreview />
        </Reveal>
      </div>
    </section>
  )
}
