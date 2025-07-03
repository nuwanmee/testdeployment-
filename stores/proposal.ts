// stores/proposal.ts
import { create } from 'zustand';

type Proposal = {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: Date;
};

type ProposalStore = {
  proposals: Proposal[];
  notifications: number;
  actions: {
    addProposal: (proposal: Proposal) => void;
    updateProposal: (id: number, status: Proposal['status']) => void;
    addNotification: () => void;
    clearNotifications: () => void;
  };
};

export const useProposalStore = create<ProposalStore>((set) => ({
  proposals: [],
  notifications: 0,
  actions: {
    addProposal: (proposal) => set((state) => ({
      proposals: [...state.proposals, proposal],
      notifications: state.notifications + (proposal.status === 'ACCEPTED' ? 1 : 0)
    })),
    updateProposal: (id, status) => set((state) => ({
      proposals: state.proposals.map(p => 
        p.id === id ? { ...p, status } : p
      ),
      notifications: status === 'ACCEPTED' 
        ? state.notifications + 1 
        : state.notifications
    })),
    addNotification: () => set((state) => ({ notifications: state.notifications + 1 })),
    clearNotifications: () => set({ notifications: 0 })
  }
}));


// Selectors
export const useProposalActions = () => useProposalStore((state) => state.actions);
export const useProposals = () => useProposalStore((state) => state.proposals);
export const useNotifications = () => useProposalStore((state) => state.notifications);

// Add to stores/proposal.ts
export const useHasAcceptedProposal = (userId1: number, userId2: number) => 
  useProposalStore((state) => 
    state.proposals.some(p => 
      (p.senderId === userId1 && p.receiverId === userId2 && p.status === 'ACCEPTED') ||
      (p.senderId === userId2 && p.receiverId === userId1 && p.status === 'ACCEPTED')
    )
  );

  
// import { create } from 'zustand';
// import { immer } from 'zustand/middleware/immer';

// type Proposal = {
//   id: number;
//   senderId: number;
//   receiverId: number;
//   status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
// };

// type ProposalStore = {
//   proposals: Proposal[];
//   notifications: {
//     count: number;
//     lastUpdate: string | null;
//   };
//   actions: {
//     addProposal: (proposal: Proposal) => void;
//     updateProposalStatus: (id: number, status: Proposal['status']) => void;
//     addNotification: () => void;
//     clearNotifications: () => void;
//   };
// };

// export const useProposalStore = create<ProposalStore>()(
//   immer((set) => ({
//     proposals: [],
//     notifications: {
//       count: 0,
//       lastUpdate: null,
//     },
//     actions: {
//       addProposal: (proposal) =>
//         set((state) => {
//           state.proposals.push(proposal);
//           state.notifications.count += 1;
//           state.notifications.lastUpdate = new Date().toISOString();
//         }),
//       updateProposalStatus: (id, status) =>
//         set((state) => {
//           const proposal = state.proposals.find((p) => p.id === id);
//           if (proposal) {
//             proposal.status = status;
//             if (status === 'ACCEPTED') {
//               state.notifications.count += 1;
//               state.notifications.lastUpdate = new Date().toISOString();
//             }
//           }
//         }),
//       addNotification: () =>
//         set((state) => {
//           state.notifications.count += 1;
//           state.notifications.lastUpdate = new Date().toISOString();
//         }),
//       clearNotifications: () =>
//         set((state) => {
//           state.notifications.count = 0;
//         }),
//     },
//   }))
// );

// // Selector hooks
// export const useProposals = () => useProposalStore((state) => state.proposals);
// export const useNotifications = () => useProposalStore((state) => state.notifications);
// export const useProposalActions = () => useProposalStore((state) => state.actions);