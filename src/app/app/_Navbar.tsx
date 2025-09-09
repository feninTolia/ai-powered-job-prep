'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/features/users/components/UserAvatar';
import { SignOutButton, useClerk } from '@clerk/clerk-react';
import {
  BookOpenIcon,
  BrainCircuitIcon,
  FileSlidersIcon,
  LogOut,
  SpeechIcon,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Interviews', href: 'interviews', Icon: SpeechIcon },
  { name: 'Questions', href: 'questions', Icon: BookOpenIcon },
  { name: 'Resume', href: 'resume', Icon: FileSlidersIcon },
];

const Navbar = ({ user }: { user: { name: string; imageUrl: string } }) => {
  const { openUserProfile } = useClerk();
  const { jobInfoId } = useParams();
  const pathname = usePathname();

  return (
    <header className="h-header border-b flex items-center justify-between container">
      <Link href="/app" className="flex items-center space-x-2">
        <BrainCircuitIcon className=" text-primary size-8" />
        <span className="font-bold text-xl">Landr</span>
      </Link>

      <div className="flex items-center space-x-4">
        {typeof jobInfoId === 'string' &&
          navLinks.map(({ name, Icon, href }) => {
            const hrefPath = `/app/job-infos/${jobInfoId}/${href}`;

            return (
              <Button
                key={name}
                variant={hrefPath === pathname ? 'secondary' : 'ghost'}
                asChild
                className="cursor-pointer max-sm:hidden"
              >
                <Link href={href}>
                  <Icon className="size-4" />
                  {name}
                </Link>
              </Button>
            );
          })}

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
