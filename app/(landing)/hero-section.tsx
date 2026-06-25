"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HeroHeader } from "./header"
import { Reveal } from "./reveal"
import { MenuPreview } from "./menu-preview"
import { Authenticated, Unauthenticated } from "convex/react"
import { SignUpButton } from "@clerk/nextjs"
import { UtensilsCrossed, ArrowRight } from "lucide-react"

export default function HeroSection() {
  const reduce = useReducedMotion()
  return (
    <>
      <HeroHeader />
      <main>
        <section className="relative overflow-hidden">
          {/* Soft warm glow behind the hero */}
          <div
            aria-hidden
            className="bg-primary/15 pointer-events-none absolute -top-32 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-3xl"
          />
          <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <span className="border-border bg-card text-muted-foreground mx-auto flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-sm shadow-sm">
                  <UtensilsCrossed className="text-primary size-4" />
                  For restaurants, cafés & canteens
                </span>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-7 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
                  Plan every meal. Share one{" "}
                  <span className="text-primary">living menu.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg text-balance">
                  MenuMatch lets your team build a menu library, schedule meals
                  across the day and week, and share a public page that always
                  shows what's being served right now.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Authenticated>
                    <Button asChild size="lg">
                      <Link href="/dashboard">
                        Go to dashboard
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </Authenticated>
                  <Unauthenticated>
                    <SignUpButton mode="modal">
                      <Button size="lg">
                        Get started free
                        <ArrowRight className="size-4" />
                      </Button>
                    </SignUpButton>
                  </Unauthenticated>
                  <Button asChild size="lg" variant="outline">
                    <Link href="#showcase">See a live menu</Link>
                  </Button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.24} y={32}>
              <motion.div
                className="relative mx-auto mt-16 max-w-4xl"
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 7, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <MenuPreview />
              </motion.div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  )
}
