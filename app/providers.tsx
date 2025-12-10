// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { PermissionProvider } from './_components/contexts/PermissionContext'; // Add this import

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <PermissionProvider> {/* Wrap with PermissionProvider */}
        {children}
      </PermissionProvider>
    </QueryClientProvider>
  );
}