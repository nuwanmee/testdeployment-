// lib/admin/actions/user-actions.ts
"use server"

import prisma from "@/prisma/client"
import { revalidatePath } from "next/cache"

eexport async function toggleUserStatus(userId: number, status: "active" | "inactive") {
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  })
  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${userId}`)
}