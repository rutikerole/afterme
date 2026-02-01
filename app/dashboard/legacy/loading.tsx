import { SkeletonHeader, SkeletonCard, SkeletonListItem } from "@/components/ui";

export default function LegacyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <SkeletonHeader />

        {/* Progress Overview Skeleton */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-sage/10 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-32 skeleton rounded" />
            <div className="h-5 w-16 skeleton rounded" />
          </div>
          <div className="h-3 w-full skeleton rounded-full mb-2" />
          <div className="h-4 w-48 skeleton rounded" />
        </div>

        {/* Instructions Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-sage/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 skeleton rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 w-36 skeleton rounded mb-2" />
                  <div className="h-3 w-24 skeleton rounded" />
                </div>
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <SkeletonListItem key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <div className="h-12 w-48 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}
