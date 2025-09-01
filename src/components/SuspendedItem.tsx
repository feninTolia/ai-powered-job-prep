import { ReactNode, Suspense } from 'react';

type Props<T> = {
  item: Promise<T>;
  fallback: ReactNode;
  result: (item: T) => ReactNode;
};

export const SuspendedItem = <T,>({ item, fallback, result }: Props<T>) => {
  return (
    <Suspense fallback={fallback}>
      <InnerComponent item={item} result={result} />
    </Suspense>
  );
};

const InnerComponent = async <T,>({
  item,
  result,
}: Pick<Props<T>, 'item' | 'result'>) => {
  return result(await item);
};
