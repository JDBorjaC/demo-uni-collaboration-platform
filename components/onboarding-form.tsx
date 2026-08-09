"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { completeOnboarding } from "@/app/actions/onboarding"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type Affiliation = { id: string; name: string; domain: string }

export function OnboardingForm({ affiliations, userName }: { affiliations: Affiliation[]; userName: string }) {
  const router = useRouter()
  const [role, setRole] = useState<"student" | "faculty" | "admin">("student")
  const [affiliationId, setAffiliationId] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await completeOnboarding({
      role,
      bio,
      universityAffiliationId: affiliationId,
      institutionalEmail: email,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    toast.success("Welcome to Collab!")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Collab logo" width={36} height={36} className="rounded-md" />
            <span className="font-semibold text-lg tracking-tight text-foreground">Collab</span>
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              Hi {userName.split(" ")[0]}, let&apos;s set up your profile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              This helps us verify your institutional affiliation and tailor your experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">I am a</Label>
              <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty member</SelectItem>
                  <SelectItem value="admin">Institution admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="affiliation">Institution</Label>
              <Select value={affiliationId} onValueChange={(val) => setAffiliationId(val ?? "")}>
                <SelectTrigger id="affiliation">
                  <SelectValue placeholder="Select your university" />
                </SelectTrigger>
                <SelectContent>
                  {affiliations.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Institutional email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
              />
              <p className="text-xs text-muted-foreground">
                We check that this matches your institution&apos;s email domain to verify your account.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bio">Short bio (optional)</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Research interests, department, or areas of expertise"
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading || !affiliationId} className="w-full">
              {loading ? "Setting up..." : "Complete setup"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
