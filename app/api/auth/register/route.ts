import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { roles } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const { email, password, password2 } = await request.json()

    // Validation
    if (!email || !password || !password2) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== password2) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 2) {
      return NextResponse.json(
        { error: 'Password must be at least 2 characters' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Set admin role if email matches
    const role = email === process.env.ADMIN_EMAIL?.toLowerCase() 
      ? roles.admin 
      : roles.client

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      }
    })

    return NextResponse.json(
      { message: 'User registered successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}