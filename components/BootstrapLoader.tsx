// components/BootstrapLoader.tsx
"use client";

import dynamic from 'next/dynamic';

const BootstrapClient = dynamic(
  () => import('./BootstrapClient'),
  { ssr: false }
);

export default function BootstrapLoader() {
  return <BootstrapClient />;
}