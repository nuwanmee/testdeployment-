
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Proposal } from '@/store/proposalStore';
import { formatDistanceToNow } from 'date-fns';

interface ProposalCardProps {
  proposal: Proposal;
  viewMode: 'sent' | 'received';
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onWithdraw?: (id: number) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  viewMode,
  onAccept,
  onReject,
  onWithdraw,
}) => {
  const displayUser = viewMode === 'sent' ? proposal.receiver : proposal.sender;
  const timeAgo = formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true });

  const getBadgeColor = () => {
    switch (proposal.status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex p-4 justify-between items-start">
        <div className="flex-1 pr-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">
                {displayUser?.firstName} {displayUser?.lastName}
              </h3>
              <span className="text-sm text-gray-500">{timeAgo}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${getBadgeColor()}`}>
              {proposal.status}
            </span>
          </div>
          {proposal.message && (
            <div className="mt-2 text-gray-700">
              <p className="text-sm">{proposal.message}</p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {viewMode === 'received' && proposal.status === 'PENDING' && (
              <>
                <button
                  onClick={() => onAccept?.(proposal.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => onReject?.(proposal.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Decline
                </button>
              </>
            )}
            {viewMode === 'sent' && proposal.status === 'PENDING' && (
              <button
                onClick={() => onWithdraw?.(proposal.id)}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Withdraw
              </button>
            )}
          </div>
        </div>

        {/* Profile Picture with Link on Right */}
        <Link href={`/profiles/${displayUser?.id || ''}`} className="flex-shrink-0 text-center group">
          {displayUser?.profilePicture ? (
            <Image
              src={displayUser.profilePicture}
              alt={`${displayUser.firstName}'s profile picture`}
              width={80}
              height={80}
              className="rounded-full object-cover mx-auto"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
              <span className="text-gray-500 text-xl">{displayUser?.firstName?.[0] || '?'}</span>
            </div>
          )}
          <span className="text-blue-600 hover:underline mt-1 block text-sm group-hover:text-blue-800">
            View Profile
          </span>
        </Link>
      </div>
    </div>
  );
};

export default ProposalCard;


// import React from 'react';
// import Image from 'next/image';
// import { Proposal } from '@/store/proposalStore';
// import { formatDistanceToNow } from 'date-fns';
// import { cn } from "@/lib/utils"

// interface ProposalCardProps {
//   proposal: Proposal;
//   viewMode: 'sent' | 'received';
//   onAccept?: (id: number) => void;
//   onReject?: (id: number) => void;
//   onWithdraw?: (id: number) => void;
//     onGoToProfile?: (userId: number) => void; // Add this prop
// }

// const ProposalCard: React.FC<ProposalCardProps> = ({
//   proposal,
//   viewMode,
//   onAccept,
//   onReject,
//   onWithdraw,
//     onGoToProfile
// }) => {
//   // Determine which user to display
//   const displayUser = viewMode === 'sent' ? proposal.receiver : proposal.sender;
  
//   // Format time ago
//   const timeAgo = formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true });
  
//   // Determine status badge color
//   const getBadgeColor = () => {
//     switch (proposal.status) {
//       case 'PENDING': return 'bg-yellow-100 text-yellow-800';
//       case 'ACCEPTED': return 'bg-green-100 text-green-800';
//       case 'REJECTED': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//     const handleProfileClick = (e: React.MouseEvent) => {
//         e.stopPropagation(); // Prevent card click
//         if (displayUser?.id && onGoToProfile) {
//             onGoToProfile(displayUser.id);
//         }
//     };
  
//   return (
//     <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//       <div className="flex p-4 justify-between">
//         <div className="flex-1">
//           <div className="flex justify-between items-start">
//             <div>
//               <h3 className="font-medium text-lg">
//                 {displayUser?.firstName} {displayUser?.lastName}
//               </h3>
//               <span className="text-sm text-gray-500">{timeAgo}</span>
//             </div>
//             <span className={`px-2 py-1 rounded-full text-xs ${getBadgeColor()}`}>
//               {proposal.status}
//             </span>
//           </div>
          
//           {proposal.message && (
//             <div className="mt-2 text-gray-700">
//               <p className="text-sm">{proposal.message}</p>
//             </div>
//           )}
          
//           <div className="mt-4 flex gap-2">
//             {viewMode === 'received' && proposal.status === 'PENDING' && (
//               <>
//                 <button
//                   onClick={() => onAccept?.(proposal.id)}
//                   className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
//                 >
//                   Accept
//                 </button>
//                 <button
//                   onClick={() => onReject?.(proposal.id)}
//                   className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
//                 >
//                   Decline
//                 </button>
//               </>
//             )}
            
//             {viewMode === 'sent' && proposal.status === 'PENDING' && (
//               <button
//                 onClick={() => onWithdraw?.(proposal.id)}
//                 className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
//               >
//                 Withdraw
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Profile Picture and Link */}
//         <div className="flex-shrink-0 flex flex-col items-end">
//                     {displayUser?.profilePicture ? (
//                         <Image
//                             src={displayUser.profilePicture}
//                             alt={`${displayUser.firstName}'s profile picture`}
//                             width={80}
//                             height={80}
//                             className="rounded-full object-cover cursor-pointer"
//                             onClick={handleProfileClick}
//                         />
//                     ) : (
//                         <div
//                             className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
//                             onClick={handleProfileClick}
//                         >
//                             <span className="text-gray-500 text-xl">
//                                 {displayUser?.firstName?.[0] || '?'}
//                             </span>
//                         </div>
//                     )}
//                     {displayUser?.id && onGoToProfile && (
//                         <button
//                             onClick={handleProfileClick}
//                             className="mt-2 text-blue-500 hover:underline text-sm"
//                         >
//                             View Profile
//                         </button>
//                     )}
//                 </div>
//       </div>
//     </div>
//   );
// };

// export default ProposalCard;


// // src/components/proposals/ProposalCard.tsx
// import React from 'react';
// import Image from 'next/image';
// import { Proposal } from '@/store/proposalStore';
// import { formatDistanceToNow } from 'date-fns';

// interface ProposalCardProps {
//   proposal: Proposal;
//   viewMode: 'sent' | 'received';
//   onAccept?: (id: number) => void;
//   onReject?: (id: number) => void;
//   onWithdraw?: (id: number) => void;
// }

// const ProposalCard: React.FC<ProposalCardProps> = ({
//   proposal,
//   viewMode,
//   onAccept,
//   onReject,
//   onWithdraw
// }) => {
//   // Determine which user to display
//   const displayUser = viewMode === 'sent' ? proposal.receiver : proposal.sender;
  
//   // Format time ago
//   const timeAgo = formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true });
  
//   // Determine status badge color
//   const getBadgeColor = () => {
//     switch (proposal.status) {
//       case 'PENDING': return 'bg-yellow-100 text-yellow-800';
//       case 'ACCEPTED': return 'bg-green-100 text-green-800';
//       case 'REJECTED': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   return (

//     <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//   <div className="flex p-4 justify-between items-center">
//     <div className="flex-1">
//       <div className="flex justify-between items-start">
//         <div>
//           <h3 className="font-medium text-lg">
//             <a href={`/profile/${displayUser?.id}`} className="text-blue-600 hover:underline">
//               {displayUser?.firstName} {displayUser?.lastName}
//             </a>
//           </h3>
//           <span className="text-sm text-gray-500">{timeAgo}</span>
//         </div>
//         <span className={`px-2 py-1 rounded-full text-xs ${getBadgeColor()}`}>
//           {proposal.status}
//         </span>
//       </div>

//       {proposal.message && (
//         <div className="mt-2 text-gray-700">
//           <p className="text-sm">{proposal.message}</p>
//         </div>
//       )}

//       <div className="mt-4 flex gap-2">
//         {viewMode === 'received' && proposal.status === 'PENDING' && (
//           <>
//             <button
//               onClick={() => onAccept?.(proposal.id)}
//               className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
//             >
//               Accept
//             </button>
//             <button
//               onClick={() => onReject?.(proposal.id)}
//               className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
//             >
//               Decline
//             </button>
//           </>
//         )}

//         {viewMode === 'sent' && proposal.status === 'PENDING' && (
//           <button
//             onClick={() => onWithdraw?.(proposal.id)}
//             className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
//           >
//             Withdraw
//           </button>
//         )}
//       </div>
//     </div>

//     <div className="flex-shrink-0">
//       {displayUser?.profilePicture ? (
//         <Image
//           src={displayUser.profilePicture}
//           alt={`${displayUser.firstName}'s profile picture`}
//           width={80}
//           height={80}
//           className="rounded-full object-cover"
//         />
//       ) : (
//         <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
//           <span className="text-gray-500 text-xl">
//             {displayUser?.firstName?.[0] || '?'}
//           </span>
//         </div>
//       )}
//     </div>
//   </div>
// </div>


  //   <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
  //     <div className="flex p-4">
  //       <div className="flex-shrink-0">
  //         {displayUser?.profilePicture ? (
  //           <Image
  //             src={displayUser.profilePicture}
  //             alt={`${displayUser.firstName}'s profile picture`}
  //             width={80}
  //             height={80}
  //             className="rounded-full object-cover"
  //           />
  //         ) : (
  //           <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
  //             <span className="text-gray-500 text-xl">
  //               {displayUser?.firstName?.[0] || '?'}
  //             </span>
  //           </div>
  //         )}
  //       </div>
        
  //       <div className="ml-4 flex-1">
  //         <div className="flex justify-between items-start">
  //           <div>
  //             <h3 className="font-medium text-lg">
  //               {displayUser?.firstName} {displayUser?.lastName}
  //             </h3>
  //             <span className="text-sm text-gray-500">{timeAgo}</span>
  //           </div>
  //           <span className={`px-2 py-1 rounded-full text-xs ${getBadgeColor()}`}>
  //             {proposal.status}
  //           </span>
  //         </div>
          
  //         {proposal.message && (
  //           <div className="mt-2 text-gray-700">
  //             <p className="text-sm">{proposal.message}</p>
  //           </div>
  //         )}
          
  //         <div className="mt-4 flex gap-2">
  //           {viewMode === 'received' && proposal.status === 'PENDING' && (
  //             <>
  //               <button
  //                 onClick={() => onAccept?.(proposal.id)}
  //                 className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
  //               >
  //                 Accept
  //               </button>
  //               <button
  //                 onClick={() => onReject?.(proposal.id)}
  //                 className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
  //               >
  //                 Decline
  //               </button>
  //             </>
  //           )}
            
  //           {viewMode === 'sent' && proposal.status === 'PENDING' && (
  //             <button
  //               onClick={() => onWithdraw?.(proposal.id)}
  //               className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
  //             >
  //               Withdraw
  //             </button>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
//    );
// };

// export default ProposalCard;