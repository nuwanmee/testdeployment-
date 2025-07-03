import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Function to recursively convert Date objects to ISO strings
const convertDatesToString = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDatesToString);
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = convertDatesToString(obj[key]);
    }
  }
  return newObj;
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = parseInt(session.user.id as string, 10);
    if (isNaN(userId)) {
      return new Response("Invalid user ID", { status: 400 });
    }

    const userWithSavedProfiles = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        SavedProfiles: {
          select: {
            profile: {
              include: {
                photos: true,
                user: true, // Includes another User object
              },
            },
          },
        },
      },
    });

    if (!userWithSavedProfiles) {
      return new Response("User not found", { status: 404 });
    }

    // Convert the result to a JSON serializable format
    const serializableSavedProfiles = userWithSavedProfiles.SavedProfiles.map(savedProfile => ({
      ...savedProfile,
      profile: convertDatesToString(savedProfile.profile),
    }));

    return Response.json(serializableSavedProfiles);

  } catch (error: any) {
    console.error("Error fetching saved profiles:", error);
    return new Response(`Failed to fetch saved profiles: ${error.message}`, { status: 500 });
  }
}