import type React from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getProfileByUserId } from "@/lib/queries"
import { SiteHeader } from "@/components/site-header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const profile = await getProfileByUserId(session.user.id)
  if (!profile) redirect("/onboarding")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={session.user} profile={profile} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
