'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/features/users/components/UserAvatar';
import { SignOutButton, useClerk } from '@clerk/clerk-react';
import { BrainCircuitIcon, LogOut, User } from 'lucide-react';
import Link from 'next/link';

const Navbar = ({ user }: { user: { name: string; imageUrl: string } }) => {
  const { openUserProfile } = useClerk();

  return (
    <header className="h-header border-b flex items-center justify-between container">
      <Link href="/app" className="flex items-center space-x-2">
        <BrainCircuitIcon className=" text-primary size-8" />
        <span className="font-bold text-xl">Landr</span>
      </Link>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <UserAvatar user={user} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openUserProfile()}>
              <User className=" mr-2" />
              Profile
            </DropdownMenuItem>
            <SignOutButton>
              <DropdownMenuItem>
                <LogOut className=" mr-2" />
                Logout
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
