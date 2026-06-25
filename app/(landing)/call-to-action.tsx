"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Authenticated, Unauthenticated } from "convex/react"
import { SignUpButton } from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"
import { Reveal } from "./reveal"

export default function CallToAction() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="bg-primary text-primary-foreground relative mx-auto max-w-5xl overflow-hidden rounded-[calc(var(--radius)+12px)] px-6 py-16 text-center md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-black/10 blur-3xl"
        />
        <Reveal className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
            Bring a little calm to your menu.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-balance opacity-90">
            Set up your first menu in minutes and share a living page your guests
            will love.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Authenticated>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard">
                  Go to dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Authenticated>
            <Unauthenticated>
              <SignUpButton mode="modal">
                <Button size="lg" variant="secondary">
                  Get started free
                  <ArrowRight className="size-4" />
                </Button>
              </SignUpButton>
            </Unauthenticated>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
