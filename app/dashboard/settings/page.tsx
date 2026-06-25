"use client"

import { OrganizationProfile } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { resolvedTheme } = useTheme()

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div>
        <h2 className="text-xl font-semibold">Organization settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage your organization's name, logo, and members.
        </p>
      </div>

      <OrganizationProfile
        routing="hash"
        appearance={{
          baseTheme: resolvedTheme === "dark" ? dark : undefined,
          elements: {
            rootBox: "w-full",
            cardBox: "w-full max-w-none shadow-none border rounded-lg",
          },
        }}
      />
    </div>
  )
}
