import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

const BackLink = ({ children, href, className }: Props) => {
  return (
    <Button variant="ghost" className={cn('-ml-3', className)} size="sm">
      <Link
        href={href}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft />
        {children}
      </Link>
    </Button>
  );
};

export default BackLink;
