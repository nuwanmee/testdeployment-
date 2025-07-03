// app/api/profiles/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerAdminNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = await prisma.profile.create({
      data: {
        ...body,
        status: 'pending'
      }
    });
    
    await triggerAdminNotification('new_profile', profile.id);
    
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Profile creation failed' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const existing = await prisma.profile.findUnique({
      where: { id: body.id }
    });
    
    const profile = await prisma.profile.update({
      where: { id: body.id },
      data: {
        ...body,
        status: existing?.status === 'approved' ? 'pending' : existing?.status
      }
    });
    
    if (existing?.status === 'approved') {
      await triggerAdminNotification('profile_update', profile.id);
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Profile update failed' },
      { status: 500 }
    );
  }
}