// types/photo.d.ts
interface Photo {
  id: number;
  url: string;
  publicId: string;
  isMain: boolean;
  isApproved: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}