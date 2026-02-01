import { SkeletonHeader, SkeletonVoiceMessage, SkeletonStats } from "@/components/ui";

export default function VoiceLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <SkeletonHeader />

        {/* Recording Area Skeleton */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-sage/10 shadow-sm mb-8">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-24 h-24 rounded-full skeleton mb-6" />
            <div className="h-6 w-48 skeleton rounded mb-3" />
            <div className="h-4 w-64 skeleton rounded" />
          </div>
        </div>

        {/* Stats */}
        <SkeletonStats className="mb-8" />

        {/* Voice Messages List */}
        <div className="space-y-4">
          <div className="h-6 w-40 skeleton rounded mb-4" />
          {[...Array(4)].map((_, i) => (
            <SkeletonVoiceMessage key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
