"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { withdrawApplication } from "@/app/actions/applications"

export function WithdrawApplicationButton({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleWithdraw() {
    setLoading(true)
    const result = await withdrawApplication(applicationId)
    setLoading(false)
    if (!result.success) return toast.error(result.error)
    toast.success("Application withdrawn")
    router.refresh()
  }

  return (
    <Button size="sm" variant="outline" onClick={handleWithdraw} disabled={loading}>
      {loading ? "Withdrawing..." : "Withdraw"}
    </Button>
  )
}
