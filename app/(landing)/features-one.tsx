"use client"

import {
  BookOpen,
  CalendarRange,
  Clock,
  LayoutGrid,
  Users,
  Share2,
} from "lucide-react"
import { Reveal } from "./reveal"

const FEATURES = [
  {
    icon: BookOpen,
    title: "A tidy menu library",
    body: "Capture every dish once — title, description, photo and meal type — and reuse it across any day.",
  },
  {
    icon: CalendarRange,
    title: "Drag-to-schedule calendar",
    body: "Drop meals onto a 24-hour day view or a month overview. Drag across hours to set a window like lunch 12–3.",
  },
  {
    icon: Clock,
    title: "A menu that knows the time",
    body: "Your public page always opens on what's being served right now, with up-next just a tap away.",
  },
  {
    icon: LayoutGrid,
    title: "Sets & custom meal types",
    body: "Arrange dishes into SET A, B, C and define your own meal types — breakfast, dinner, or a 3pm tea break.",
  },
  {
    icon: Users,
    title: "Built for your whole team",
    body: "Organizations, members and roles keep your kitchen and front-of-house working from one shared menu.",
  },
  {
    icon: Share2,
    title: "Share anywhere",
    body: "Every organization gets a clean public link — perfect for a website, a QR code on the table, or a screen.",
  },
]

export default function FeaturesOne() {
  return (
    <section id="features" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
              Everything in one place
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              From the kitchen to the table, calmly.
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={0.05 * (i % 3)} className="h-full">
              <div className="bg-card border-border h-full rounded-[var(--radius)] border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="bg-secondary text-primary flex size-12 items-center justify-center rounded-xl">
                  <feature.icon className="size-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {feature.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
