import { ClerkProvider as OriginalClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

export function ClerkProvider({ children }: { children: ReactNode }) {
  return <OriginalClerkProvider>{children}</OriginalClerkProvider>;
}
