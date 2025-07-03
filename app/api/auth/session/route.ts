// app/api/auth/session/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Make sure this path is correct
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json(session);
}