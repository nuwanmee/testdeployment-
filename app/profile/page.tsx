import { authOptions } from "@/auth";
import Navbar from "@/components/layout/Navbar";
import SidebarLayout from "@/components/layout/SidebarLayout";
import ProfileForm from "@/components/ProfileForm";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import BackButton from "@/components/ui/BackButton";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div className="alert alert-danger">Please sign in to view your profile</div>;
  }

  const userId = parseInt(session.user.id);
  
  // Prisma returns Profile | null, convert to Profile | undefined
  const profileFromDb = await prisma.profile.findUnique({
    where: { userId },
    include: {
      photos: true
    }
  });
  
  // Convert null to undefined for consistent typing
  const profile = profileFromDb ?? undefined;

  return (
    <SidebarLayout>
      <Navbar />
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-5 fw-bold mb-0">Your Profile</h1>
            <BackButton className="btn btn-outline-secondary mt-3" />
          </div>
        </div>
        
        <div className="row">
          <div className="col-lg-6 mb-4 mb-lg-0">
            {/* Pass undefined instead of null for consistency */}
            <ProfileForm profile={profile} />
          </div>
          <div className="col-lg-6">
            {/* Only show ProfileInfoCard if profile exists */}
            {profile && (
              <div className="sticky-lg-top" style={{top: '20px'}}>
                <ProfileInfoCard profile={profile} />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

// import { authOptions } from "@/auth";
// import Navbar from "@/components/layout/Navbar";
// import SidebarLayout from "@/components/layout/SidebarLayout";
// import ProfileForm from "@/components/ProfileForm";
// import ProfileInfoCard from "@/components/ProfileInfoCard";
// import BackButton from "@/components/ui/BackButton";
// import  {prisma}  from "@/lib/prisma";
// import { getServerSession } from "next-auth";

// export default async function ProfilePage() {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user?.id) {
//     return <div className="alert alert-danger">Please sign in to view your profile</div>;
//   }

//   const userId = parseInt(session.user.id);
//   const profile = await prisma.profile.findUnique({
//     where: { userId },
//     include: {
//       photos: true
//     }
//   });

//   return (
//     <SidebarLayout>
//       <Navbar />
//       <div className="container-fluid py-4">
//         <div className="row mb-4">
//           <div className="col-12">
//             <h1 className="display-5 fw-bold mb-0">Your Profile</h1>
//             <BackButton className="btn btn-outline-secondary mt-3" />
//           </div>
//         </div>
        
//         <div className="row">
//           <div className="col-lg-6 mb-4 mb-lg-0">
//             {/* Always show ProfileForm, pass null if no profile exists */}
//             <ProfileForm profile={profile || null} />
//           </div>
//           <div className="col-lg-6">
//             {/* Only show ProfileInfoCard if profile exists */}
//             {profile && (
//               <div className="sticky-lg-top" style={{top: '20px'}}>
//                 <ProfileInfoCard profile={profile} />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </SidebarLayout>
//   );
// }

// // app/profile/page.tsx
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../api/auth/[...nextauth]/route';
// import { prisma } from '@/lib/prisma';
// import ProfileForm from '@/components/ProfileForm';
// import BackButton from '@/components/ui/BackButton';
// import { Sidebar } from 'lucide-react';
// import SidebarLayout from '@/components/layout/SidebarLayout';
// import Navbar from '@/components/layout/Navbar';

// export default async function ProfilePage() {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user?.id) {
//     return <div>Please sign in to view your profile</div>;
//   }

//   const userId = parseInt(session.user.id);
//   const profile = await prisma.profile.findUnique({
//     where: { userId },
//     include: {
//       photos: true
//     }
//   });


// return (
//   <SidebarLayout>
//     <Navbar />
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
//       {profile?.id && <ProfileForm profile={profile} />}
//       <BackButton />
//     </div>
//   </SidebarLayout>
// );

  // return (
  //   <SidebarLayout>
  //     <Navbar />
  //   <div className="container mx-auto py-8">
  //     <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
  //     <ProfileForm profile={profile} />
  //     <BackButton />
  //   </div>
  //   </SidebarLayout>
  // );
