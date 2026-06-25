"use client"

import { Reveal } from "./reveal"

const STEPS = [
  {
    n: "01",
    title: "Create your space",
    body: "Set up your organization in seconds and invite your team — everyone works from one shared menu.",
  },
  {
    n: "02",
    title: "Build & schedule",
    body: "Add your dishes to the library, then drop meals onto the calendar. Drag across hours to set a window.",
  },
  {
    n: "03",
    title: "Share your menu",
    body: "Send guests your public page. It always shows what's on right now — no daily updates to chase.",
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="bg-secondary/40 scroll-mt-24 border-y border-border py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
              How it works
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Three calm steps to a living menu.
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={0.08 * i}>
              <div className="flex flex-col gap-4">
                <span className="text-primary/70 text-5xl font-bold tabular-nums">
                  {step.n}
                </span>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
