import { NextResponse } from 'next/server';

export async function GET() {
  console.log(`Current DB connection: ${process.env.DATABASE_URL}`);
  return NextResponse.json({ 
    message: "Database connection checked",
    dbConnected: !!process.env.DATABASE_URL
  });
}