"use client";
import { useRouter } from 'next/navigation';
import { Button } from 'react-bootstrap';

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className, ...props }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="primary"
      onClick={() => router.back()}
      className={`px-4 py-2 ${className || ''}`}
      {...props}
    >
      <i className="bi bi-arrow-left me-2"></i> Go Back
    </Button>
  );
}

// "use client";

// import { useRouter } from 'next/navigation';

// export default function BackButton() {
//   const router = useRouter();

//   return (
//     <button 
//       onClick={() => router.back()}
//       className="btn btn-primary btn-lg px-4 py-2 fw-bold"
//     >
//       <i className="bi bi-arrow-left me-2"></i> Go Back
//     </button>
//   );
// }