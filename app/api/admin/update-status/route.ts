// app/api/admin/update-status/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status } = await req.json()

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({
      message: 'User status updated successfully',
      user: updatedUser
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}