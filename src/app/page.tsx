import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="flex justify-between p-6">
      <SignInButton />
      <SignOutButton />
      <UserButton />
      <ThemeToggle />
    </div>
  );
}
