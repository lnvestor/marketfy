'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the SimpleChat component
const SimpleChat = dynamic(() => import('./simple-chat'), { ssr: false });

export default function DashboardChatProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <SimpleChat />;
}