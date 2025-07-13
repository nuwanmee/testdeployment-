// app/api/admin/profiles/[id]/approve/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params
  const resolvedParams = await params;
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const profile = await prisma.profile.update({
      where: { id: resolvedParams.id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: session.user.id
      }
    });
    
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Approval failed' },
      { status: 500 }
    );
  }
}

// // app/api/admin/profiles/[id]/approve/route.ts
// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth'

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getServerSession(authOptions);
  
//   if (!session || session.user.role !== 'admin') {
//     return NextResponse.json(
//       { error: 'Unauthorized' },
//       { status: 403 }
//     );
//   }
  
//   try {
//     const profile = await prisma.profile.update({
//       where: { id: params.id },
//       data: {
//         status: 'approved',
//         approvedAt: new Date(),
//         approvedBy: session.user.id
//       }
//     });
    
//     return NextResponse.json(profile);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Approval failed' },
//       { status: 500 }
//     );
//   }
// }