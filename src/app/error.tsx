'use client'; // Error boundaries must be Client Components

import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { BrainCircuitIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.log('error ====', error);
  }, [error]);

  return (
    <div className="">
      <div className="h-header border-b flex items-center justify-between container">
        <Link href="/app" className="flex items-center space-x-2">
          <BrainCircuitIcon className=" text-primary size-8" />
          <span className="font-bold text-xl">Landr</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className=" container flex flex-col gap-2 items-center justify-center h-screen-header">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="mb-4">Please try later.</p>
        <Button
          className="cursor-pointer"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
