import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import Spinner from './ui/spinner';

export default function GlobalLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching + isMutating > 0;

  if (!isLoading) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-full shadow-lg p-2">
      <Spinner size="sm" />
    </div>
  );
}