// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../api/auth/[...nextauth]/route';
// import { prisma } from '@/lib/prisma';
// import ProfileList from '../../components/ProfileList';
// import ProfileFilter from '../../components/ProfileFilter';
// import { User, Proposal } from '@prisma/client';
// import { Prisma } from '@prisma/client';
// import { ProposalStore, useProposalActions } from '@/stores/proposal';
// import Navbar from '@/components/layout/Navbar';
// import SidebarLayout from '@/components/layout/SidebarLayout';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { Button } from 'react-bootstrap';

// interface ProfileWithDetails extends User {
//   profile?: {
//     id: number;
//     familyDetails?: string | null;
//     hobbies?: string | null;
//     expectations?: string | null;
//     gender?: string | null;
//     birthday?: Date | null;
//     height?: number | null;
//     district?: string | null;
//     photos?: {
//       id: number;
//       url: string;
//       isMain: boolean;
//     }[];
//   } | null;
//   receivedProposals: Proposal[];
//   sentProposals: Proposal[];
// }

// export default async function ProfilesPage({
//   searchParams = {},
// }: {
//   searchParams?: { [key: string]: string | string[] | undefined };
// }) {
//   // Get the current user session
//   const session = await getServerSession(authOptions);
//   const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
  
//   // Safely get pagination params with defaults
//   const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
//   const perPage = typeof searchParams.perPage === 'string' ? Number(searchParams.perPage) : 20;
//   const skip = (page - 1) * perPage;

//   // Get filter parameters
//   const gender = typeof searchParams.gender === 'string' ? searchParams.gender : undefined;
//   const ageMin = typeof searchParams.ageMin === 'string' && searchParams.ageMin !== '' ? Number(searchParams.ageMin) : undefined;
//   const ageMax = typeof searchParams.ageMax === 'string' && searchParams.ageMax !== '' ? Number(searchParams.ageMax) : undefined;
//   const heightMin = typeof searchParams.heightMin === 'string' && searchParams.heightMin !== '' ? Number(searchParams.heightMin) : undefined;
//   const heightMax = typeof searchParams.heightMax === 'string' && searchParams.heightMax !== '' ? Number(searchParams.heightMax) : undefined;
//   const districts = Array.isArray(searchParams.districts) ? searchParams.districts : 
//     typeof searchParams.districts === 'string' ? [searchParams.districts] : undefined;

//   // Build base query
//   const where: Prisma.UserWhereInput = {
//     role: 'CLIENT',
//     isProfileComplete: true,
    
//     // Explicitly exclude the current user
//     ...(currentUserId && { id: { not: currentUserId } }),
    
//     profile: {}
//   };

//   // Add filters
//   if (gender && gender !== '') {
//     where.profile = { ...where.profile, gender };
//   }

//   // Age filter (using birthday)
//   if (ageMin !== undefined || ageMax !== undefined) {
//     const today = new Date();
//     where.profile = {
//       ...where.profile,
//       birthday: {}
//     };
    
//     if (ageMax !== undefined) {
//       where.profile.birthday.gte = new Date(
//         today.getFullYear() - ageMax - 1, 
//         today.getMonth(), 
//         today.getDate()
//       );
//     }
    
//     if (ageMin !== undefined) {
//       where.profile.birthday.lte = new Date(
//         today.getFullYear() - ageMin, 
//         today.getMonth(), 
//         today.getDate()
//       );
//     }
//   }

//   // Height filter
//   if (heightMin !== undefined || heightMax !== undefined) {
//     where.profile = {
//       ...where.profile,
//       height: {}
//     };
//     if (heightMin !== undefined) where.profile.height.gte = heightMin;
//     if (heightMax !== undefined) where.profile.height.lte = heightMax;
//   }

//   // District filter
//   if (districts && districts.length > 0) {
//     where.profile = {
//       ...where.profile,
//       district: { in: districts }
//     };
//   }

//   // Get profiles
//   const [totalProfiles, profiles] = await Promise.all([
//     prisma.user.count({ where }),
//     prisma.user.findMany({
//       where,
//       skip,
//       take: perPage,
//       orderBy: { updatedAt: 'desc' },
//       include: {
//         profile: {
//           include: {
//             photos: {
//               select: { id: true, url: true, isMain: true },
//             },
//           },
//         },
//         sentProposals: currentUserId ? {
//           where: { receiverId: currentUserId },
//           select: { id: true, status: true, senderId: true, receiverId: true },
//         } : false,
//         receivedProposals: currentUserId ? {
//           where: { senderId: currentUserId },
//           select: { id: true, status: true, senderId: true, receiverId: true },
//         } : false,
//       },
//     })
//   ]);

//   // Note: Since this is a server component, we can't use React state directly.
//   // We'll use a search param to control the filter visibility
//   const showFilters = searchParams.showFilters !== 'false';

//   return (
//     <SidebarLayout>
//       <div>
//         <Navbar />
        
//         {/* Filter Toggle Button */}
//         <div className="mb-3 d-flex justify-content-end">
//           <Button 
//             variant="outline-secondary" 
//             href={`?${new URLSearchParams({
//               ...searchParams,
//               showFilters: (!showFilters).toString()
//             })}`}
//             size="sm"
//             className="d-flex align-items-center gap-1"
//           >
//             {showFilters ? (
//               <>
//                 <FaEyeSlash /> Hide Filters
//               </>
//             ) : (
//               <>
//                 <FaEye /> Show Filters
//               </>
//             )}
//           </Button>
//         </div>

//         {/* Conditionally render ProfileFilter */}
//         {showFilters && <ProfileFilter />}
        
//         <ProfileList
//           initialProfiles={profiles}
//           totalProfiles={totalProfiles}
//           page={page}
//           perPage={perPage}
//           currentUserId={currentUserId}
//         />
//       </div>
//     </SidebarLayout>
//   );
// }


// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../api/auth/[...nextauth]/route';
// import { prisma } from '@/lib/prisma';
// import ProfileList from '../../components/ProfileList';
// import ProfileFilter from '../../components/ProfileFilter';
// import { User, Proposal } from '@prisma/client';
// import { Prisma } from '@prisma/client';
// import { ProposalStore, useProposalActions } from '@/stores/proposal';
// import Navbar from '@/components/layout/Navbar';
// import SidebarLayout from '@/components/layout/SidebarLayout';

// interface ProfileWithDetails extends User {
//   profile?: {
//     id: number;
//     familyDetails?: string | null;
//     hobbies?: string | null;
//     expectations?: string | null;
//     gender?: string | null;
//     birthday?: Date | null;
//     height?: number | null;
//     district?: string | null;
//     photos?: {
//       id: number;
//       url: string;
//       isMain: boolean;
//     }[];
//   } | null;
//   receivedProposals: Proposal[];
//   sentProposals: Proposal[];
// }

// export default async function ProfilesPage({
//   searchParams = {},
// }: {
//   searchParams?: { [key: string]: string | string[] | undefined };
// }) {
//   // Get the current user session
//   const session = await getServerSession(authOptions);
//   const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
  
//   // Safely get pagination params with defaults
//   const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
//   const perPage = typeof searchParams.perPage === 'string' ? Number(searchParams.perPage) : 20;
//   const skip = (page - 1) * perPage;

//   // Get filter parameters
//   const gender = typeof searchParams.gender === 'string' ? searchParams.gender : undefined;
//   const ageMin = typeof searchParams.ageMin === 'string' && searchParams.ageMin !== '' ? Number(searchParams.ageMin) : undefined;
//   const ageMax = typeof searchParams.ageMax === 'string' && searchParams.ageMax !== '' ? Number(searchParams.ageMax) : undefined;
//   const heightMin = typeof searchParams.heightMin === 'string' && searchParams.heightMin !== '' ? Number(searchParams.heightMin) : undefined;
//   const heightMax = typeof searchParams.heightMax === 'string' && searchParams.heightMax !== '' ? Number(searchParams.heightMax) : undefined;
//   const districts = Array.isArray(searchParams.districts) ? searchParams.districts : 
//     typeof searchParams.districts === 'string' ? [searchParams.districts] : undefined;

//   // Build base query
//   const where: Prisma.UserWhereInput = {
//     role: 'CLIENT',
//     isProfileComplete: true,
    
//     // Explicitly exclude the current user
//     ...(currentUserId && { id: { not: currentUserId } }),
    
//     profile: {}
//   };

//   // Add filters
//   if (gender && gender !== '') {
//     where.profile = { ...where.profile, gender };
//   }

//   // Age filter (using birthday)
//   if (ageMin !== undefined || ageMax !== undefined) {
//     const today = new Date();
//     where.profile = {
//       ...where.profile,
//       birthday: {}
//     };
    
//     if (ageMax !== undefined) {
//       where.profile.birthday.gte = new Date(
//         today.getFullYear() - ageMax - 1, 
//         today.getMonth(), 
//         today.getDate()
//       );
//     }
    
//     if (ageMin !== undefined) {
//       where.profile.birthday.lte = new Date(
//         today.getFullYear() - ageMin, 
//         today.getMonth(), 
//         today.getDate()
//       );
//     }
//   }

//   // Height filter
//   if (heightMin !== undefined || heightMax !== undefined) {
//     where.profile = {
//       ...where.profile,
//       height: {}
//     };
//     if (heightMin !== undefined) where.profile.height.gte = heightMin;
//     if (heightMax !== undefined) where.profile.height.lte = heightMax;
//   }

//   // District filter
//   if (districts && districts.length > 0) {
//     where.profile = {
//       ...where.profile,
//       district: { in: districts }
//     };
//   }

//   // Get profiles
//   const [totalProfiles, profiles] = await Promise.all([
//     prisma.user.count({ where }),
//     prisma.user.findMany({
//       where,
//       skip,
//       take: perPage,
//       orderBy: { updatedAt: 'desc' },
//       include: {
//         profile: {
//           include: {
//             photos: {
//               select: { id: true, url: true, isMain: true },
//             },
//           },
//         },
//         sentProposals: currentUserId ? {
//           where: { receiverId: currentUserId },
//           select: { id: true, status: true, senderId: true, receiverId: true },
//         } : false,
//         receivedProposals: currentUserId ? {
//           where: { senderId: currentUserId },
//           select: { id: true, status: true, senderId: true, receiverId: true },
//         } : false,
//       },
//     })
//   ]);

//   return (
//     <SidebarLayout>
//     <div>
//       <Navbar />
//       <ProfileFilter />
//       <ProfileList
//         initialProfiles={profiles}
//         totalProfiles={totalProfiles}
//         page={page}
//         perPage={perPage}
//         currentUserId={currentUserId}
//       />
//     </div>
//     </SidebarLayout>
//   );
// }


// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../api/auth/[...nextauth]/route';
// import { prisma } from '@/lib/prisma';
// import ProfileList from '../../components/ProfileList';
// import ProfileFilter from '../../components/ProfileFilter';
// import { User, Proposal } from '@prisma/client';
// import { Prisma } from '@prisma/client';
// import Navbar from '@/components/layout/Navbar';
// import SidebarLayout from '@/components/layout/SidebarLayout';

// interface ProfileWithDetails extends User {
//   profile?: {
//     id: number;
//     familyDetails?: string | null;
//     hobbies?: string | null;
//     expectations?: string | null;
//     gender?: string | null;
//     birthday?: Date | null;
//     height?: number | null;
//     district?: string | null;
//     photos?: {
//       id: number;
//       url: string;
//       isMain: boolean;
//     }[];
//   } | null;
//   receivedProposals: Proposal[];
//   sentProposals: Proposal[];
// }

// export default async function ProfilesPage({
//   searchParams = {},
// }: {
//   searchParams?: { [key: string]: string | string[] | undefined };
// }) {
//   // Get the current user session
//   const session = await getServerSession(authOptions);
//   const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
  
//   // Safely get pagination params with defaults
//   const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
//   const perPage = typeof searchParams.perPage === 'string' ? Number(searchParams.perPage) : 20;
//   const skip = (page - 1) * perPage;

//   // Get filter parameters
//   const gender = typeof searchParams.gender === 'string' ? searchParams.gender : undefined;
//   const ageMin = typeof searchParams.ageMin === 'string' && searchParams.ageMin !== '' ? Number(searchParams.ageMin) : undefined;
//   const ageMax = typeof searchParams.ageMax === 'string' && searchParams.ageMax !== '' ? Number(searchParams.ageMax) : undefined;
//   const heightMin = typeof searchParams.heightMin === 'string' && searchParams.heightMin !== '' ? Number(searchParams.heightMin) : undefined;
//   const heightMax = typeof searchParams.heightMax === 'string' && searchParams.heightMax !== '' ? Number(searchParams.heightMax) : undefined;
//   const districts = Array.isArray(searchParams.districts) ? searchParams.districts : 
//     typeof searchParams.districts === 'string' ? [searchParams.districts] : undefined;

//   // Build base query
//   const where: Prisma.UserWhereInput = {
//     role: 'CLIENT',
//     isProfileComplete: true,
    
//     // Explicitly exclude the current user
//     ...(currentUserId && { id: { not: currentUserId } }),
    
//     profile: {}
//   };

//   // Add filters
//   if (gender && gender !== '') {
//     where.profile = { ...where.profile, gender };
//   }

//   // Age filter (using birthday)
//   if (ageMin !== undefined || ageMax !== undefined) {
//     const today = new Date();
//     where.profile = {
//       ...where.profile,
//       birthday: {}
//     };
    
//     if (ageMax !== undefined) {
//       where.profile.birthday.gte = new Date(
//         today.getFullYear() - ageMax - 1, 
//         today.getMonth(), 
//         today.getDate()
//       );
//     }
    
//     if (ageMin !== undefined) {
//       where.profile.birthday.lte = new Date(
//         today.getFullYear() - ageMin, 
//         today.getMonth(), 
//         today.getDate()
//       );
//     }
//   }

//   // Height filter
//   if (heightMin !== undefined || heightMax !== undefined) {
//     where.profile = {
//       ...where.profile,
//       height: {}
//     };
//     if (heightMin !== undefined) where.profile.height.gte = heightMin;
//     if (heightMax !== undefined) where.profile.height.lte = heightMax;
//   }

//   // District filter
//   if (districts && districts.length > 0) {
//     where.profile = {
//       ...where.profile,
//       district: { in: districts }
//     };
//   }

//   // Get profiles
//   const [totalProfiles, profiles] = await Promise.all([
//     prisma.user.count({ where }),
//     prisma.user.findMany({
//       where,
//       skip,
//       take: perPage,
//       orderBy: { updatedAt: 'desc' },
//       include: {
//         profile: {
//           include: {
//             photos: {
//               select: { id: true, url: true, isMain: true },
//             },
//           },
//         },
//         sentProposals: currentUserId ? {
//           where: { receiverId: currentUserId },
//           select: { id: true, status: true, senderId: true, receiverId: true },
//         } : false,
//         receivedProposals: currentUserId ? {
//           where: { senderId: currentUserId },
//           select: { id: true, status: true, senderId: true, receiverId: true },
//         } : false,
//       },
//     })
//   ]);

//   return (
//     <SidebarLayout>
//       <div className="container-fluid">
//         <Navbar />
//         <div className="row g-3">
//           {/* Main content column (ProfileList) */}
//           <div className="col-lg-8 col-md-7 order-md-1 order-2">
//             <ProfileList
//               initialProfiles={profiles}
//               totalProfiles={totalProfiles}
//               page={page}
//               perPage={perPage}
//               currentUserId={currentUserId}
//             />
//           </div>
          
//           {/* Sidebar column (ProfileFilter) */}
//           <div className="col-lg-4 col-md-5 order-md-2 order-1">
//             <div className="sticky-top" style={{ top: '20px' }}>
//               <ProfileFilter />
//             </div>
//           </div>
//         </div>
//       </div>
//     </SidebarLayout>
//   );
// }
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ProfileList from '../../components/ProfileList';
import ProfileFilter from '../../components/ProfileFilter';
import { User, Proposal } from '@prisma/client';
import { Prisma } from '@prisma/client';
import Navbar from '@/components/layout/Navbar';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Container, Row, Col } from 'react-bootstrap';

interface ProfileWithDetails extends User {
  profile?: {
    id: number;
    familyDetails?: string | null;
    hobbies?: string | null;
    expectations?: string | null;
    gender?: string | null;
    birthday?: Date | null;
    height?: number | null;
    district?: string | null;
    photos?: {
      id: number;
      url: string;
      isMain: boolean;
    }[];
  } | null;
  receivedProposals: Proposal[];
  sentProposals: Proposal[];
}

export default async function ProfilesPage({
  searchParams = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Get the current user session
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
  
  // Safely get pagination params with defaults
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const perPage = typeof searchParams.perPage === 'string' ? Number(searchParams.perPage) : 20;
  const skip = (page - 1) * perPage;

  // Get filter parameters
  const gender = typeof searchParams.gender === 'string' ? searchParams.gender : undefined;
  const ageMin = typeof searchParams.ageMin === 'string' && searchParams.ageMin !== '' ? Number(searchParams.ageMin) : undefined;
  const ageMax = typeof searchParams.ageMax === 'string' && searchParams.ageMax !== '' ? Number(searchParams.ageMax) : undefined;
  const heightMin = typeof searchParams.heightMin === 'string' && searchParams.heightMin !== '' ? Number(searchParams.heightMin) : undefined;
  const heightMax = typeof searchParams.heightMax === 'string' && searchParams.heightMax !== '' ? Number(searchParams.heightMax) : undefined;
  const districts = Array.isArray(searchParams.districts) ? searchParams.districts : 
    typeof searchParams.districts === 'string' ? [searchParams.districts] : undefined;


const where: Prisma.UserWhereInput = {
  role: 'CLIENT',
  isProfileComplete: true,
  status: 'active',
  profile: {
    status: 'approved' // Add this line to only get approved profiles
  },
  ...(currentUserId && { id: { not: currentUserId } })
};

  // Build base query
  // const where: Prisma.UserWhereInput = {
  //   role: 'CLIENT',
  //   isProfileComplete: true,
  //   ...(currentUserId && { id: { not: currentUserId } }),
  //   profile: {}
  // };

  // Add filters
  if (gender && gender !== '') {
    where.profile = { ...where.profile, gender };
  }

  // Age filter (using birthday)
  if (ageMin !== undefined || ageMax !== undefined) {
    const today = new Date();
    where.profile = {
      ...where.profile,
      birthday: {}
    };
    
    if (ageMax !== undefined) {
      where.profile.birthday.gte = new Date(
        today.getFullYear() - ageMax - 1, 
        today.getMonth(), 
        today.getDate()
      );
    }
    
    if (ageMin !== undefined) {
      where.profile.birthday.lte = new Date(
        today.getFullYear() - ageMin, 
        today.getMonth(), 
        today.getDate()
      );
    }
  }

  // Height filter
  if (heightMin !== undefined || heightMax !== undefined) {
    where.profile = {
      ...where.profile,
      height: {}
    };
    if (heightMin !== undefined) where.profile.height.gte = heightMin;
    if (heightMax !== undefined) where.profile.height.lte = heightMax;
  }

  // District filter
  if (districts && districts.length > 0) {
    where.profile = {
      ...where.profile,
      district: { in: districts }
    };
  }

  // Get profiles
  const [totalProfiles, profiles] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { updatedAt: 'desc' },
      include: {
        profile: {
          include: {
            photos: {
              select: { id: true, url: true, isMain: true },
            },
          },
        },
        sentProposals: currentUserId ? {
          where: { receiverId: currentUserId },
          select: { id: true, status: true, senderId: true, receiverId: true },
        } : false,
        receivedProposals: currentUserId ? {
          where: { senderId: currentUserId },
          select: { id: true, status: true, senderId: true, receiverId: true },
        } : false,
      },
    })
  ]);

  return (
    <SidebarLayout>
      <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
        <Navbar />
        <Container fluid className="flex-grow-1 py-3">
          <Row className="g-3">
            {/* Main Content Column (ProfileList) */}
            <Col lg={8} className="order-lg-1 order-2">
              <div className="h-100" style={{ overflowY: 'auto' }}>
                <ProfileList
                  initialProfiles={profiles}  // Now properly defined
                  totalProfiles={totalProfiles}
                  page={page}
                  perPage={perPage}
                  currentUserId={currentUserId}
                />
              </div>
            </Col>

            {/* Sidebar Column (ProfileFilter) */}
            <Col lg={4} className="order-lg-2 order-1">
              <div 
                className="sticky-top" 
                style={{ 
                  top: '80px',
                  height: 'calc(100vh - 100px)',
                  overflowY: 'auto'
                }}
              >
                <ProfileFilter />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </SidebarLayout>
  );
}