import type React from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getProfileByUserId } from "@/lib/queries"
import { AdminSidebar } from "@/components/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const profile = await getProfileByUserId(session.user.id)
  if (!profile) redirect("/onboarding")

  // Only admin and moderator roles can access the admin panel
  if (profile.role !== "admin" && profile.role !== "moderator") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar user={session.user} profile={profile} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
