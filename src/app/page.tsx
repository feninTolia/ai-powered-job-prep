import { ThemeToggle } from '@/components/ThemeToggle';
import {
  PricingTable,
  SignInButton,
  SignOutButton,
  UserButton,
} from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end gap-4">
        <SignInButton />
        <SignOutButton />
        <UserButton />
        <ThemeToggle />
      </div>
      <PricingTable />
    </div>
  );
}
