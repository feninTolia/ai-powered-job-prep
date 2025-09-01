import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export const Skeleton = ({ className }: Props) => {
  return (
    <span
      className={cn(
        'animate-pulse bg-muted rounded h-[1.25em] w-full max-w-full inline-block align-bottom',
        className
      )}
    />
  );
};

export const SkeletonButton = ({ className }: Props) => {
  return <Skeleton className={cn('h-9', className)} />;
};
