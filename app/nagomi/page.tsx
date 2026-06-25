"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google"
import { motion, useReducedMotion } from "framer-motion"
import { Leaf, Package, Wind, ArrowUpRight, Check } from "lucide-react"

// ── Type as the hero: a calm, airy serif paired with a humane grotesque ──
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

// ── Tokenised palette: warm neutrals with sparing, intentional blooms ──
const c = {
  paper: "#F4F1EA",
  paperDeep: "#ECE7DB",
  surface: "#FBFAF6",
  ink: "#2E2A24",
  inkSoft: "#6F6657",
  line: "#DDD5C6",
  clay: "#B5654A",
  clayDeep: "#9E4F37",
  sage: "#7E8E6B",
  ochre: "#C0973F",
  dusk: "#67788A",
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Soft, slow scroll-reveal — fades and settles rather than pops.
function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const SEASONS = [
  {
    name: "Spring",
    word: "Awakening",
    note: "Warm tea, an open window, and the first green pushing through.",
    color: c.sage,
  },
  {
    name: "Summer",
    word: "Lightness",
    note: "Linen against skin, long evenings, bare feet on warm wood.",
    color: c.ochre,
  },
  {
    name: "Autumn",
    word: "Gathering",
    note: "Cedar smoke, slow soups, and the low amber light of afternoons.",
    color: c.clay,
  },
  {
    name: "Winter",
    word: "Stillness",
    note: "Candlelight, wool, and the deep comfort of having less.",
    color: c.dusk,
  },
]

const STEPS = [
  {
    icon: Wind,
    title: "Notice",
    body: "Each season opens with a short letter and a single intention to carry quietly through your days.",
  },
  {
    icon: Package,
    title: "Receive",
    body: "One considered object arrives — hand-thrown, hand-woven, or hand-poured by a small maker we love.",
  },
  {
    icon: Leaf,
    title: "Return",
    body: "A simple practice helps you fold a moment of stillness back into the most ordinary hours.",
  },
]

export default function NagomiPage() {
  const reduce = useReducedMotion()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const prev = document.title
    document.title = "Nagomi — seasonal rituals for unhurried living"
    const root = document.documentElement
    const prevScroll = root.style.scrollBehavior
    if (!reduce) root.style.scrollBehavior = "smooth"
    return () => {
      document.title = prev
      root.style.scrollBehavior = prevScroll
    }
  }, [reduce])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
  }

  return (
    <div
      className={`${sans.className} relative min-h-dvh overflow-x-hidden`}
      style={{ backgroundColor: c.paper, color: c.ink }}
    >
      {/* Tactile paper grain — wabi-sabi texture, barely there */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />

      {/* ─────────────────────────── Header ─────────────────────────── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ borderColor: c.line, backgroundColor: "rgba(244,241,234,0.72)" }}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a
            href="#top"
            className={`${display.className} text-2xl tracking-wide`}
            style={{ color: c.ink }}
          >
            Nagomi
          </a>
          <div
            className="hidden items-center gap-10 text-sm tracking-wide sm:flex"
            style={{ color: c.inkSoft }}
          >
            <a href="#practice" className="transition-opacity hover:opacity-60">
              The practice
            </a>
            <a href="#seasons" className="transition-opacity hover:opacity-60">
              Seasons
            </a>
            <a href="#object" className="transition-opacity hover:opacity-60">
              This season
            </a>
          </div>
          <a
            href="#invitation"
            className="rounded-full border px-5 py-2 text-sm tracking-wide transition-colors"
            style={{ borderColor: c.ink, color: c.ink }}
          >
            Begin
          </a>
        </nav>
      </header>

      <main id="top" className="relative z-10">
        {/* ─────────────────────────── Hero ─────────────────────────── */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pt-20 pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28 lg:pb-36">
          <div>
            <Reveal>
              <p
                className="mb-8 text-xs tracking-[0.32em] uppercase"
                style={{ color: c.inkSoft }}
              >
                Seasonal rituals for unhurried living
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1
                className={`${display.className} text-5xl leading-[1.05] font-medium sm:text-6xl lg:text-7xl`}
                style={{ color: c.ink }}
              >
                Make space for
                <br />
                the quiet things.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p
                className="mt-8 max-w-md text-lg leading-relaxed"
                style={{ color: c.inkSoft }}
              >
                Four times a year, Nagomi sends you one beautifully made object
                and a simple seasonal practice — a gentle invitation to slow
                down, notice, and feel at home in your own days.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <a
                  href="#invitation"
                  className="rounded-full px-7 py-3.5 text-sm font-medium tracking-wide text-white transition-transform duration-300 hover:-translate-y-0.5"
                  style={{ backgroundColor: c.clayDeep }}
                >
                  Begin the first season
                </a>
                <a
                  href="#practice"
                  className="inline-flex items-center gap-1.5 text-sm tracking-wide transition-opacity hover:opacity-60"
                  style={{ color: c.ink }}
                >
                  How it unfolds
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Tactile panel — a window onto warm, crafted light */}
          <Reveal delay={0.2} y={32}>
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem]"
              style={{ backgroundColor: c.paperDeep, boxShadow: "0 30px 60px -30px rgba(46,42,36,0.25)" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(120% 90% at 70% 20%, ${c.surface} 0%, ${c.paperDeep} 45%, #E2D8C4 100%)`,
                }}
              />
              {/* Slowly drifting blooms — light moving across a wall */}
              <motion.div
                aria-hidden
                className="absolute -top-10 left-8 size-48 rounded-full blur-3xl"
                style={{ backgroundColor: c.ochre, opacity: 0.28 }}
                animate={reduce ? undefined : { y: [0, 26, 0], x: [0, 14, 0] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 19, repeat: Infinity, ease: "easeInOut" }
                }
              />
              <motion.div
                aria-hidden
                className="absolute right-6 bottom-10 size-56 rounded-full blur-3xl"
                style={{ backgroundColor: c.sage, opacity: 0.26 }}
                animate={reduce ? undefined : { y: [0, -22, 0], x: [0, -10, 0] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 23, repeat: Infinity, ease: "easeInOut" }
                }
              />
              {/* A single, hand-thrown vessel rendered in pure form */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-44 w-36 rounded-[44%_44%_46%_46%/38%_38%_62%_62%]"
                  style={{
                    background: `linear-gradient(160deg, #D9CDB6 0%, #C9B79A 55%, #B49E7E 100%)`,
                    boxShadow: "inset 8px -10px 28px rgba(46,42,36,0.22), inset -6px 4px 14px rgba(255,255,255,0.4)",
                  }}
                />
              </div>
              <p
                className="absolute bottom-6 left-7 text-xs tracking-[0.2em] uppercase"
                style={{ color: c.inkSoft }}
              >
                Hand-thrown stoneware · winter
              </p>
            </div>
          </Reveal>
        </section>

        {/* ────────────────────────── Manifesto ────────────────────────── */}
        <section
          className="relative border-y"
          style={{ borderColor: c.line, backgroundColor: c.paperDeep }}
        >
          <span
            aria-hidden
            className={`${display.className} pointer-events-none absolute inset-0 flex items-center justify-center select-none`}
            style={{ color: c.ink, opacity: 0.04, fontSize: "26rem", lineHeight: 1 }}
          >
            和
          </span>
          <div className="relative mx-auto max-w-3xl px-6 py-28 text-center lg:py-36">
            <Reveal>
              <p
                className={`${display.className} text-3xl leading-snug font-light sm:text-4xl lg:text-5xl`}
                style={{ color: c.ink }}
              >
                In a louder world, we are quietly making room to breathe — less,
                made well, is more than enough.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─────────────────────────── Practice ─────────────────────────── */}
        <section id="practice" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28 lg:py-36">
          <Reveal>
            <p
              className="mb-4 text-xs tracking-[0.32em] uppercase"
              style={{ color: c.clay }}
            >
              The practice
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className={`${display.className} max-w-2xl text-4xl leading-tight font-medium sm:text-5xl`}
              style={{ color: c.ink }}
            >
              A small ritual, gently repeated.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={0.1 + i * 0.1}>
                <div className="flex flex-col gap-5">
                  <div
                    className="flex size-14 items-center justify-center rounded-full border"
                    style={{ borderColor: c.line, color: c.clay, backgroundColor: c.surface }}
                  >
                    <step.icon className="size-6" strokeWidth={1.25} />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-xs tracking-[0.2em] tabular-nums"
                      style={{ color: c.inkSoft }}
                    >
                      0{i + 1}
                    </span>
                    <h3
                      className={`${display.className} text-2xl font-medium`}
                      style={{ color: c.ink }}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p className="leading-relaxed" style={{ color: c.inkSoft }}>
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─────────────────────────── Seasons ─────────────────────────── */}
        <section
          id="seasons"
          className="scroll-mt-24 border-y"
          style={{ borderColor: c.line, backgroundColor: c.surface }}
        >
          <div className="mx-auto max-w-6xl px-6 py-28 lg:py-36">
            <Reveal>
              <p
                className="mb-4 text-xs tracking-[0.32em] uppercase"
                style={{ color: c.sage }}
              >
                Four seasons, four rituals
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2
                className={`${display.className} max-w-2xl text-4xl leading-tight font-medium sm:text-5xl`}
                style={{ color: c.ink }}
              >
                The year, received one season at a time.
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2" style={{ borderColor: c.line, backgroundColor: c.line }}>
              {SEASONS.map((s, i) => (
                <Reveal key={s.name} delay={0.08 * i} className="h-full">
                  <article
                    className="flex h-full flex-col gap-4 p-9 lg:p-11"
                    style={{ backgroundColor: c.paper }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                        aria-hidden
                      />
                      <span
                        className="text-xs tracking-[0.24em] uppercase"
                        style={{ color: c.inkSoft }}
                      >
                        {s.name}
                      </span>
                    </div>
                    <h3
                      className={`${display.className} text-3xl font-medium`}
                      style={{ color: s.color }}
                    >
                      {s.word}
                    </h3>
                    <p className="leading-relaxed" style={{ color: c.inkSoft }}>
                      {s.note}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────── Featured object ──────────────────────── */}
        <section id="object" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28 lg:py-36">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal y={32}>
              <div
                className="relative aspect-square w-full overflow-hidden rounded-[2rem]"
                style={{ backgroundColor: c.paperDeep }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(110% 100% at 30% 25%, ${c.surface} 0%, #E6DCC8 55%, #D2C2A4 100%)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="h-52 w-52 rounded-full"
                    style={{
                      background: `linear-gradient(155deg, #D7CAB1 0%, #C3B093 60%, #AD9876 100%)`,
                      boxShadow: "inset 10px -14px 36px rgba(46,42,36,0.22), inset -8px 6px 16px rgba(255,255,255,0.45)",
                    }}
                  />
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <p
                  className="mb-4 text-xs tracking-[0.32em] uppercase"
                  style={{ color: c.clay }}
                >
                  This season
                </p>
              </Reveal>
              <Reveal delay={0.06}>
                <h2
                  className={`${display.className} text-4xl leading-tight font-medium sm:text-5xl`}
                  style={{ color: c.ink }}
                >
                  The Asunaro cup
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-6 max-w-md text-lg leading-relaxed" style={{ color: c.inkSoft }}>
                  Thrown by hand from local clay and finished in a soft oat-ash
                  glaze, each cup carries the gentle marks of the maker. No two
                  are alike. Made to be held with both hands, on a slow morning,
                  with nowhere else to be.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <dl
                  className="mt-10 grid max-w-md grid-cols-2 gap-y-5 border-t pt-8 text-sm"
                  style={{ borderColor: c.line }}
                >
                  {[
                    ["Material", "Local stoneware"],
                    ["Finish", "Oat-ash glaze"],
                    ["Maker", "A small studio in the hills"],
                    ["Each", "Quietly imperfect"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-1">
                      <dt className="tracking-[0.16em] uppercase" style={{ color: c.inkSoft }}>
                        {k}
                      </dt>
                      <dd style={{ color: c.ink }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─────────────────────────── Quote ─────────────────────────── */}
        <section
          className="border-y"
          style={{ borderColor: c.line, backgroundColor: c.paperDeep }}
        >
          <div className="mx-auto max-w-3xl px-6 py-28 text-center lg:py-32">
            <Reveal>
              <blockquote
                className={`${display.className} text-2xl leading-relaxed font-light sm:text-3xl`}
                style={{ color: c.ink }}
              >
                “I didn’t realise how loud my days had become until something
                quiet arrived in the post.”
              </blockquote>
            </Reveal>
            <Reveal delay={0.1}>
              <p
                className="mt-8 text-xs tracking-[0.28em] uppercase"
                style={{ color: c.inkSoft }}
              >
                Mira · a member since the first spring
              </p>
            </Reveal>
          </div>
        </section>

        {/* ────────────────────────── Invitation ────────────────────────── */}
        <section id="invitation" className="mx-auto max-w-2xl scroll-mt-24 px-6 py-28 text-center lg:py-40">
          <Reveal>
            <p
              className="mb-5 text-xs tracking-[0.32em] uppercase"
              style={{ color: c.clay }}
            >
              An open invitation
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className={`${display.className} text-4xl leading-tight font-medium sm:text-5xl`}
              style={{ color: c.ink }}
            >
              Receive the first season.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed" style={{ color: c.inkSoft }}>
              Leave us a little space to write to you. No noise, no rush — just a
              quiet letter when the season turns.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            {sent ? (
              <div
                className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3 rounded-2xl border px-6 py-5"
                style={{ borderColor: c.sage, backgroundColor: c.surface, color: c.ink }}
                role="status"
                aria-live="polite"
              >
                <Check className="size-5" strokeWidth={1.75} style={{ color: c.sage }} />
                Thank you — your first season is on its way.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-10 flex max-w-md flex-col gap-3 text-left sm:flex-row"
              >
                <div className="flex-1">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@quiet.morning"
                    className="h-12 w-full rounded-full border bg-transparent px-5 text-base outline-none transition-shadow focus-visible:ring-2"
                    style={{ borderColor: c.line, color: c.ink }}
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 shrink-0 rounded-full px-7 text-sm font-medium tracking-wide text-white transition-transform duration-300 hover:-translate-y-0.5"
                  style={{ backgroundColor: c.clayDeep }}
                >
                  Send me an invitation
                </button>
              </form>
            )}
          </Reveal>
        </section>

        {/* ─────────────────────────── Footer ─────────────────────────── */}
        <footer className="border-t" style={{ borderColor: c.line }}>
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 sm:flex-row">
            <span className={`${display.className} text-xl`} style={{ color: c.ink }}>
              Nagomi
            </span>
            <div
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm"
              style={{ color: c.inkSoft }}
            >
              <a href="#practice" className="transition-opacity hover:opacity-60">
                The practice
              </a>
              <a href="#seasons" className="transition-opacity hover:opacity-60">
                Seasons
              </a>
              <a href="#object" className="transition-opacity hover:opacity-60">
                This season
              </a>
              <a href="#invitation" className="transition-opacity hover:opacity-60">
                Begin
              </a>
            </div>
            <span className="text-sm" style={{ color: c.inkSoft }}>
              和 · made slowly
            </span>
          </div>
        </footer>
      </main>
    </div>
  )
}
