import { ChevronDown } from "lucide-react"
import { Reveal } from "./reveal"

const FAQS = [
  {
    q: "What is MenuMatch for?",
    a: "MenuMatch helps restaurants, cafés and canteens build a reusable menu library, schedule meals across the day and week, and share a public page that always shows what's being served right now.",
  },
  {
    q: "Do my guests need an account?",
    a: "No. Your public menu page is a simple shareable link — guests just open it. Accounts are only for your team members who manage the menu.",
  },
  {
    q: "Can different days have different meals?",
    a: "Yes. Every day is independent. A day can have breakfast, lunch and dinner, only lunch, or an extra tea break — whatever you schedule on the calendar.",
  },
  {
    q: "How do meal windows work?",
    a: "On the day view you can click an hour for a single slot, or drag across hours to set a window — for example lunch from 12 to 3 — as a single entry.",
  },
  {
    q: "Can my whole team use it?",
    a: "Yes. MenuMatch is built around organizations, so you can invite members, manage roles, and everyone works from the same shared menu.",
  },
]

export default function FAQs() {
  return (
    <section className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
              Questions
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you might be wondering.
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-col gap-3">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={0.05 * i}>
              <details className="group bg-card border-border rounded-[var(--radius)] border p-5 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="text-muted-foreground size-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
