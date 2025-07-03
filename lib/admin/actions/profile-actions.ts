"use server"

import prisma from "@/prisma/client"
import { revalidatePath } from "next/cache"

export async function approveProfile(profileId: number) {
  await prisma.profile.update({
    where: { id: profileId },
    data: { status: "approved", lastUpdated: new Date() },
  })
  revalidatePaths(profileId)
}

export async function refuseProfile(profileId: number) {
  await prisma.profile.update({
    where: { id: profileId },
    data: { status: "refused", lastUpdated: new Date() },
  })
  revalidatePaths(profileId)
}

function revalidatePaths(profileId: string) {
  revalidatePath("/admin/approvals")
  revalidatePath("/admin/approved")
  revalidatePath("/admin/refused")
  revalidatePath(`/admin/users/${profileId}`)
}