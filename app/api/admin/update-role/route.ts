import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { roles } from '@/lib/constants'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== roles.admin) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { id, role } = await request.json()

    if (!id || !role) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    if (!Object.values(roles).includes(role)) {
      return NextResponse.json
     (
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Admin cannot remove themselves as admin
    if (session.user.id === id && role !== roles.admin) {
      return NextResponse.json(
        { error: 'Admins cannot remove themselves from Admin' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    })

    return NextResponse.json(
      { message: `Updated role for ${user.email} to ${user.role}` }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}