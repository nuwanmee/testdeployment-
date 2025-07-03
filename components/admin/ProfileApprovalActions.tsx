// components/admin/ProfileApprovalActions.tsx
"use client"

import { approveProfile, refuseProfile } from "@/lib/admin/actions/profile-actions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Check, X } from "lucide-react"
import { useState } from "react"

export function ProfileApprovalActions({
  profileId,
  currentStatus,
}: {
  profileId: string
  currentStatus: "pending" | "approved" | "refused"
}) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState<"approve" | "refuse" | null>(null)
  const { toast } = useToast()

  const handleApprove = async () => {
    setIsLoading("approve")
    try {
      await approveProfile(profileId)
      setStatus("approved")
      toast({
        title: "Approved",
        description: "Profile has been approved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleRefuse = async () => {
    setIsLoading("refuse")
    try {
      await refuseProfile(profileId)
      setStatus("refused")
      toast({
        title: "Refused",
        description: "Profile has been refused",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refuse profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={status === "approved" ? "default" : "outline"}
        size="sm"
        onClick={handleApprove}
        disabled={status === "approved" || isLoading === "refuse"}
      >
        {isLoading === "approve" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Approve
      </Button>
      <Button
        variant={status === "refused" ? "destructive" : "outline"}
        size="sm"
        onClick={handleRefuse}
        disabled={status === "refused" || isLoading === "approve"}
      >
        {isLoading === "refuse" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <X className="mr-2 h-4 w-4" />
        )}
        Refuse
      </Button>
    </div>
  )
}