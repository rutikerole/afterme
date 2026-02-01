import { SkeletonHeader, SkeletonStoryCard } from "@/components/ui";

export default function StoriesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <SkeletonHeader />

        {/* Prompt Card Skeleton */}
        <div className="bg-gradient-to-br from-sage/10 to-sage-light/20 rounded-2xl p-6 mb-8 border border-sage/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 skeleton rounded-xl" />
            <div className="flex-1">
              <div className="h-4 w-24 skeleton rounded mb-2" />
              <div className="h-6 w-full skeleton rounded mb-3" />
              <div className="h-10 w-36 skeleton rounded-lg" />
            </div>
          </div>
        </div>

        {/* Categories Skeleton */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-28 skeleton rounded-full shrink-0" />
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonStoryCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
