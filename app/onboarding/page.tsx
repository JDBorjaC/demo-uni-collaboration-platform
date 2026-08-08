import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getMyProfile, getUniversityAffiliations } from "@/app/actions/onboarding"
import { OnboardingForm } from "@/components/onboarding-form"

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [profile, affiliations] = await Promise.all([getMyProfile(), getUniversityAffiliations()])
  if (profile) redirect("/dashboard")

  return <OnboardingForm affiliations={affiliations} userName={session.user.name} />
}
