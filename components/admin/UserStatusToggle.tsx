// components/admin/UserStatusToggle.tsx
"use client"

import { toggleUserStatus } from "@/lib/admin/actions/user-actions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"

// components/admin/UserStatusToggle.tsx
interface UserStatusToggleProps {
  userId: number  // Changed from string to number
  initialStatus: "active" | "inactive"
}
export function UserStatusToggle({
  userId,
  initialStatus,
}: {
  userId: string
  initialStatus: "active" | "inactive"
}) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const newStatus = status === "active" ? "inactive" : "active"
      await toggleUserStatus(userId, newStatus)
      setStatus(newStatus)
      toast({
        title: "Success",
        description: `User status changed to ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={status === "active" ? "default" : "secondary"}
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        status === "active" ? "Deactivate" : "Activate"
      )}
    </Button>
  )
}