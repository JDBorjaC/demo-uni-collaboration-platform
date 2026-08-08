"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { withdrawContribution } from "@/app/actions/contributions"

export function WithdrawContributionButton({ contributionId }: { contributionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleWithdraw() {
    setLoading(true)
    const result = await withdrawContribution(contributionId)
    setLoading(false)
    if (!result.success) return toast.error(result.error)
    toast.success("Contribution withdrawn")
    router.refresh()
  }

  return (
    <Button size="sm" variant="outline" onClick={handleWithdraw} disabled={loading}>
      {loading ? "Withdrawing..." : "Withdraw"}
    </Button>
  )
}
