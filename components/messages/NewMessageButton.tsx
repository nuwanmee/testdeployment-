'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

export default function NewMessageButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push('/messages/new')}>
      <Plus className="h-4 w-4 mr-2" />
      New Message
    </Button>
  );
}