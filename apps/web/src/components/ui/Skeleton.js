export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <SkeletonBlock className="h-36 rounded-none" />
      <div className="p-5 space-y-3">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <SkeletonBlock className="h-2 w-full rounded-full" />
        <SkeletonBlock className="h-9 w-full" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-3 w-2/5" />
        <SkeletonBlock className="h-3 w-1/4" />
      </div>
      <SkeletonBlock className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="w-9 h-9 rounded-xl" />
      </div>
      <SkeletonBlock className="h-8 w-1/3" />
    </div>
  );
}

export default function Skeleton({ variant = 'block', className = '' }) {
  if (variant === 'card') return <SkeletonCard />;
  if (variant === 'row') return <SkeletonRow />;
  if (variant === 'stat') return <SkeletonStat />;
  return <SkeletonBlock className={className} />;
}
