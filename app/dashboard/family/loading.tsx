import { SkeletonHeader, SkeletonFamilyMember, SkeletonCard } from "@/components/ui";

export default function FamilyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <SkeletonHeader />

        {/* Family Tree Visualization Skeleton */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-sage/10 shadow-sm mb-8">
          <div className="flex flex-col items-center">
            {/* Central User */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 skeleton rounded-full mb-3" />
              <div className="h-5 w-20 skeleton rounded mb-1" />
              <div className="h-3 w-12 skeleton rounded" />
            </div>

            {/* Connection Lines Skeleton */}
            <div className="w-px h-8 skeleton" />

            {/* Family Members */}
            <div className="flex flex-wrap justify-center gap-8 mt-4">
              {[...Array(5)].map((_, i) => (
                <SkeletonFamilyMember key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Add Member Button Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="h-12 w-48 skeleton rounded-xl" />
        </div>

        {/* Member Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
