import { useState, useEffect } from 'react';

/**
 * Format relative elapsed real-time from server timestamp ISO string (Social Media style)
 */
export function formatRealTimeAgo(publishedDate?: string | null): string {
  if (!publishedDate) {
    return 'Just now';
  }

  const postTime = new Date(publishedDate).getTime();
  if (isNaN(postTime)) {
    return 'Just now';
  }

  const now = Date.now();
  const diffInSeconds = Math.max(0, Math.floor((now - postTime) / 1000));

  if (diffInSeconds < 5) {
    return 'Just now';
  }
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return new Date(publishedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Hook that causes a component to re-render periodically
 * to update live real-time elapsed timestamps
 */
export function useRealTimeTicker(intervalMs: number = 2000) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);
}
