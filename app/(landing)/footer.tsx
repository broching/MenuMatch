import { BrandLogo } from "@/components/logo"
import Link from "next/link"

const links = [
  { title: "Features", href: "#features" },
  { title: "How it works", href: "#how" },
  { title: "The menu", href: "#showcase" },
  // { title: "Pricing", href: "#pricing" },
  { title: "Dashboard", href: "/dashboard" },
]

export default function FooterSection() {
  return (
    <footer className="border-border border-t py-14">
      <div className="mx-auto max-w-6xl px-6">
        <Link
          href="/"
          aria-label="MenuMatch home"
          className="mx-auto flex size-fit items-center gap-2"
        >
          <BrandLogo className="size-7" />
          <span className="text-xl font-semibold">MenuMatch</span>
        </Link>

        <div className="my-8 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="text-muted-foreground hover:text-primary block duration-150"
            >
              {link.title}
            </Link>
          ))}
        </div>

        <span className="text-muted-foreground block text-center text-sm">
          © {new Date().getFullYear()} MenuMatch. Plan every meal, share one living menu.
        </span>
      </div>
    </footer>
  )
}
