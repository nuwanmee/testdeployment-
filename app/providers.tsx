// // app/providers.tsx
// 'use client'

// import { SessionProvider } from 'next-auth/react'

// export default function Providers({ 
//   children,
// }: { 
//   children: React.ReactNode 
// }) {
//   return <SessionProvider>{children}</SessionProvider>
// }


// app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}



