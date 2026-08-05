/** Skeleton loading placeholders */

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-[#C5A046]/10 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-white/5 rounded-lg" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="h-6 bg-white/5 rounded-lg w-2/3" />
      <div className="h-4 bg-white/5 rounded-lg w-full" />
      <div className="h-4 bg-white/5 rounded-lg w-4/5" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-white/5 rounded-lg" style={{ width: `${70 + i * 5}%` }} />
      ))}
    </div>
  );
}

export function SkeletonImage({ className = 'w-28 h-28' }: { className?: string }) {
  return <div className={`${className} bg-white/5 rounded-xl animate-pulse`} />;
}
