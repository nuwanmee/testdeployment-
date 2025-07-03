// store/proposalStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

// Define types based on your Prisma schema
export type ProposalStatus = 'INTEREST' | 'SENT' | 'RECEIVED' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Proposal {
  id: number;
  senderId: number;
  receiverId: number;
  status: ProposalStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  sender?: {
    id: number;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
  receiver?: {
    id: number;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
}

interface ProposalStore {
  // Proposals by status
  sentProposals: Proposal[];
  receivedProposals: Proposal[];
  pendingSentProposals: Proposal[];
  pendingReceivedProposals: Proposal[];
  acceptedProposals: Proposal[];
  rejectedSentProposals: Proposal[];
  rejectedReceivedProposals: Proposal[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUserProposals: (userId: number) => Promise<void>;
  sendProposal: (senderId: number, receiverId: number, message?: string) => Promise<void>;
  acceptProposal: (proposalId: number) => Promise<void>;
  rejectProposal: (proposalId: number) => Promise<void>;
  withdrawProposal: (proposalId: number) => Promise<void>;
}

const useProposalStore = create<ProposalStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      sentProposals: [],
      receivedProposals: [],
      pendingSentProposals: [],
      pendingReceivedProposals: [],
      acceptedProposals: [],
      rejectedSentProposals: [],
      rejectedReceivedProposals: [],
      isLoading: false,
      error: null,
      
      // Fetch all proposals for a user
      fetchUserProposals: async (userId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/api/proposals?userId=${userId}`);
          const proposals = response.data;
          
          // Process and categorize proposals
          const sentProposals = proposals.filter((p: Proposal) => p.senderId === userId);
          const receivedProposals = proposals.filter((p: Proposal) => p.receiverId === userId);
          
          set({
            sentProposals,
            receivedProposals,
            pendingSentProposals: sentProposals.filter((p: Proposal) => p.status === 'PENDING'),
            pendingReceivedProposals: receivedProposals.filter((p: Proposal) => p.status === 'PENDING'),
            acceptedProposals: [
              ...sentProposals.filter((p: Proposal) => p.status === 'ACCEPTED'),
              ...receivedProposals.filter((p: Proposal) => p.status === 'ACCEPTED')
            ],
            rejectedSentProposals: sentProposals.filter((p: Proposal) => p.status === 'REJECTED'),
            rejectedReceivedProposals: receivedProposals.filter((p: Proposal) => p.status === 'REJECTED'),
            isLoading: false
          });
        } catch (error) {
          console.error('Error fetching proposals:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch proposals' 
          });
        }
      },
      
      // Send a new proposal
      sendProposal: async (senderId: number, receiverId: number, message?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/proposals/send', {
            senderId,
            receiverId,
            message,
            status: 'PENDING'
          });
          
          const newProposal = response.data;
          
          // Update state with the new proposal
          set((state) => ({
            sentProposals: [...state.sentProposals, newProposal],
            pendingSentProposals: [...state.pendingSentProposals, newProposal],
            isLoading: false
          }));
        } catch (error) {
          console.error('Error sending proposal:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to send proposal' 
          });
        }
      },
      
      // Accept a proposal
      acceptProposal: async (proposalId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.patch(`/api/proposals/${proposalId}/accept`);
          const updatedProposal = response.data;
          
          // Update state with the modified proposal
          set((state) => {
            // Find and update the proposal in all relevant lists
            const updateProposalInList = (list: Proposal[]) => 
              list.map(p => p.id === updatedProposal.id ? updatedProposal : p);
            
            // Remove from pending lists
            const newPendingReceived = state.pendingReceivedProposals.filter(
              p => p.id !== updatedProposal.id
            );
            
            return {
              receivedProposals: updateProposalInList(state.receivedProposals),
              pendingReceivedProposals: newPendingReceived,
              acceptedProposals: [...state.acceptedProposals, updatedProposal],
              isLoading: false
            };
          });
        } catch (error) {
          console.error('Error accepting proposal:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to accept proposal' 
          });
        }
      },
      
      // Reject a proposal
      rejectProposal: async (proposalId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.patch(`/api/proposals/${proposalId}/reject`);
          const updatedProposal = response.data;
          
          set((state) => {
            // Find and update the proposal in all relevant lists
            const updateProposalInList = (list: Proposal[]) => 
              list.map(p => p.id === updatedProposal.id ? updatedProposal : p);
            
            // Remove from pending lists
            const newPendingReceived = state.pendingReceivedProposals.filter(
              p => p.id !== updatedProposal.id
            );
            
            return {
              receivedProposals: updateProposalInList(state.receivedProposals),
              pendingReceivedProposals: newPendingReceived,
              rejectedReceivedProposals: [...state.rejectedReceivedProposals, updatedProposal],
              isLoading: false
            };
          });
        } catch (error) {
          console.error('Error rejecting proposal:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to reject proposal' 
          });
        }
      },
      
      // Withdraw a sent proposal
      withdrawProposal: async (proposalId) => {
        try {
          // Simulate API call to withdraw proposal
          await fetch(`/api/proposals/${proposalId}/withdraw`, {
            method: 'POST',
          });
    
          // Update the state locally
          set({
            sentProposals: get().sentProposals.map(p =>
              p.id === proposalId ? { ...p, status: 'REJECTED' } : p
            ),
          });
        } catch (error) {
          console.error('Failed to withdraw proposal:', error);
        }
      },
    })
  )
);

export default useProposalStore;