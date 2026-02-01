import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton rounded-md bg-sage/10",
        className
      )}
    />
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PRESET SKELETONS
// ════════════════════════════════════════════════════════════════════════════

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-sage/10 shadow-sm", className)}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonPillarCard({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-sage/10 shadow-sm", className)}>
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-5 w-28 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonListItem({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-sage/10", className)}>
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="w-20 h-8 rounded-lg" />
    </div>
  );
}

export function SkeletonStats({ className }: SkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-sage/10"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonVaultItem({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-sage/10", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <div className="space-y-3 mt-4">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonHeader({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}

export function SkeletonMemoryCard({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-sage/10", className)}>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStoryCard({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-sage/10", className)}>
      <Skeleton className="h-6 w-2/3 mb-3" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-sage/10">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonFamilyMember({ className }: SkeletonProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Skeleton className="w-20 h-20 rounded-full mb-3" />
      <Skeleton className="h-4 w-16 mb-1" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

export function SkeletonVoiceMessage({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-sage/10", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-sage/10">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
