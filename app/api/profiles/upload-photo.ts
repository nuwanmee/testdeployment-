import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { uploadToCloudinary } from '@/lib/cloudinary'; // Or your preferred storage solution

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const file = req.body.file;
    const profileId = req.body.profileId;

    if (!file || !profileId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Upload to your storage solution
    const result = await uploadToCloudinary(file, `profiles/${profileId}`);

    // Here you would typically update your database with the new photo URL
    // await updateProfilePhoto(profileId, result.secure_url);

    return res.status(200).json({ photoUrl: result.secure_url });
  } catch (error) {
    console.error('Photo upload error:', error);
    return res.status(500).json({ message: 'Error uploading photo' });
  }
}