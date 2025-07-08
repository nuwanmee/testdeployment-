// app/admin/users/approvals/page.tsx
'use client';

import { useEffect } from 'react';
import { useProfileStore } from '@/stores/profileStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProfileApprovalsPage() {
  const {
    pendingProfiles,
    approvedProfiles,
    rejectedProfiles,
    fetchProfiles,
    approveProfile,
    refuseProfile,
    loading,
    error
  } = useProfileStore();

  useEffect(() => {
    console.log('Approvals page mounted - fetching profiles');
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    console.log('Pending profiles updated:', pendingProfiles);
  }, [pendingProfiles]);

  if (loading) return <div className="p-4">Loading approvals...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  console.log('Rendering with pending profiles count:', pendingProfiles.length);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Profile Approvals</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pending Approvals
            <Badge variant="outline">{pendingProfiles.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingProfiles.length > 0 ? (
            pendingProfiles.map((profile) => (
              <div key={profile.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{profile.name}</h3>
                  {profile.email && <p className="text-sm text-gray-600">{profile.email}</p>}
                  <p className="text-sm text-gray-500">
                    Created: {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button 
                    onClick={() => {
                      console.log('Approving profile:', profile.id);
                      approveProfile(profile.id);
                    }}
                    variant="outline"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('Rejecting profile:', profile.id);
                      refuseProfile(profile.id);
                    }}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No pending profiles found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// // app/admin/users/approvals/page.tsx
// 'use client';

// import { useEffect } from 'react';
// import { useProfileStore } from '@/stores/profileStore';
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';

// export default function ProfileApprovalsPage() {
//   const {
//     pendingProfiles,
//     approvedProfiles,
//     rejectedProfiles,
//     fetchProfiles,
//     approveProfile,
//     rejectProfile,
//     loading,
//     error
//   } = useProfileStore();

//   useEffect(() => {
//     fetchProfiles();
//   }, [fetchProfiles]);

//   if (loading) return <div>Loading approvals...</div>;
//   if (error) return <div className="text-red-500">Error: {error}</div>;

//   return (
//     <div className="container mx-auto p-4 space-y-6">
//       <h1 className="text-3xl font-bold">Profile Approvals</h1>
      
//       {pendingProfiles.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               Pending Approvals
//               <Badge variant="outline">{pendingProfiles.length}</Badge>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {pendingProfiles.map((profile) => (
//               <div key={profile.id} className="flex justify-between items-center p-4 border rounded-lg">
//                 <div>
//                   <h3 className="font-medium">{profile.name}</h3>
//                   <p className="text-sm text-gray-500">
//                     Created: {new Date(profile.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <div className="space-x-2">
//                   <Button 
//                     onClick={() => approveProfile(profile.id)}
//                     variant="outline"
//                   >
//                     Approve
//                   </Button>
//                   <Button 
//                     onClick={() => rejectProfile(profile.id)}
//                     variant="destructive"
//                   >
//                     Reject
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       )}

//       {/* Similar cards for approved and rejected profiles */}
//     </div>
//   );
// }