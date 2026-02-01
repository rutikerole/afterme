import { SkeletonHeader, SkeletonStats, SkeletonCard } from "@/components/ui";

export default function ProgressLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <SkeletonHeader />

        {/* Overall Progress Ring Skeleton */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="w-48 h-48 skeleton rounded-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="h-10 w-16 skeleton rounded mb-2" />
              <div className="h-4 w-20 skeleton rounded" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <SkeletonStats className="mb-12" />

        {/* Pillar Progress */}
        <div className="h-7 w-40 skeleton rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-sage/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 skeleton rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 w-28 skeleton rounded mb-2" />
                  <div className="h-3 w-16 skeleton rounded" />
                </div>
              </div>
              <div className="h-2 w-full skeleton rounded-full mb-2" />
              <div className="flex justify-between">
                <div className="h-3 w-20 skeleton rounded" />
                <div className="h-3 w-12 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="h-7 w-32 skeleton rounded mb-6" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shrink-0 w-32 h-40 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
