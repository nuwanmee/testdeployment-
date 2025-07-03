// src/components/proposals/SendProposalButton.tsx
import React, { useState } from 'react';
import useProposalStore from '@/store/proposalStore';
import { useSession } from 'next-auth/react';
import { Modal, Button, Form } from 'react-bootstrap';

interface SendProposalButtonProps {
  receiverId: number;
}

const SendProposalButton: React.FC<SendProposalButtonProps> = ({ receiverId }) => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { sendProposal, loading } = useProposalStore();
  
  const handleSendProposal = async () => {
    if (!session?.user?.id) return;
    
    await sendProposal(Number(session.user.id), receiverId, message);
    setIsModalOpen(false);
    setMessage('');
  };
  
  return (
    <>
      <Button 
        variant="primary" 
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2"
      >
        Send Proposal
      </Button>
      
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Proposal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="proposalMessage">
            <Form.Label className="visually-hidden">Proposal Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message to introduce yourself..."
              className="mb-3"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setIsModalOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendProposal}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : 'Send'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SendProposalButton;

// // src/components/proposals/SendProposalButton.tsx
// import React, { useState } from 'react';
// import useProposalStore from '@/store/proposalStore';
// import { useSession } from 'next-auth/react';

// interface SendProposalButtonProps {
//   receiverId: number;
// }

// const SendProposalButton: React.FC<SendProposalButtonProps> = ({ receiverId }) => {
//   const { data: session } = useSession();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [message, setMessage] = useState('');
//   const { sendProposal, loading } = useProposalStore();
  
//   const handleSendProposal = async () => {
//     if (!session?.user?.id) return;
    
//     await sendProposal(Number(session.user.id), receiverId, message);
//     setIsModalOpen(false);
//     setMessage('');
//   };
  
//   return (
//     <>
//       <button
//         onClick={() => setIsModalOpen(true)}
//         className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
//       >
//         Send Proposal
//       </button>
      
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h3 className="text-lg font-medium mb-4">Send Proposal</h3>
            
//             <textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Write a message to introduce yourself..."
//               className="w-full p-2 border rounded-md h-32 mb-4"
//             />
            
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSendProposal}
//                 disabled={loading}
//                 className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
//               >
//                 {loading ? 'Sending...' : 'Send'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default SendProposalButton;
