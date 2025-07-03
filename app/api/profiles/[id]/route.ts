    import {prisma} from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const fetchProfileData = async (id: string) => {
  const profile = await prisma.profile.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: true,
      photos: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ profile });
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    return await fetchProfileData(params.id);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updatedProfile = await prisma.profile.update({
      where: { id: parseInt(params.id) },
      data: {
        sex: body.sex,
        birthday: body.birthday,
        district: body.district,
        familyDetails: body.familyDetails,
        hobbies: body.hobbies,
        expectations: body.expectations,
        education: body.education,
        occupation: body.occupation,
        religion: body.religion,
        caste: body.caste,
        height: parseFloat(body.height),
        maritalStatus: body.maritalStatus,
        motherTongue: body.motherTongue,
        annualIncome: body.annualIncome,
        aboutMe: body.aboutMe,
        // You might need to handle photos update differently
      },
      include: {
        user: true,
        photos: true,
      },
    });
    return NextResponse.json({ profile: updatedProfile });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}