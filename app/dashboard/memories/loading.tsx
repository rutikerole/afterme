import { SkeletonHeader, SkeletonMemoryCard } from "@/components/ui";

export default function MemoriesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <SkeletonHeader />

        {/* Filter Pills Skeleton */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-24 skeleton rounded-full shrink-0" />
          ))}
        </div>

        {/* Memory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonMemoryCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
