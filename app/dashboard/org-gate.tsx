"use client"

import { useOrganization } from "@clerk/nextjs"
import { OrganizationList } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"

/**
 * Ensures an active Clerk organization is selected before rendering dashboard
 * content. All menu/calendar data is scoped per organization, so the rest of
 * the dashboard only mounts once `organization` is available.
 */
export function OrgGate({ children }: { children: React.ReactNode }) {
  const { organization, isLoaded } = useOrganization()
  const { theme } = useTheme()

  const appearance = { baseTheme: theme === "dark" ? dark : undefined }

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
        <div className="max-w-md space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Create your organization</h2>
          <p className="text-muted-foreground text-sm">
            MenuMatch organizes menus per organization. Create or select one to
            start adding menu items and scheduling meals.
          </p>
        </div>
        <OrganizationList
          hidePersonal
          appearance={appearance}
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
        />
      </div>
    )
  }

  return <>{children}</>
}
