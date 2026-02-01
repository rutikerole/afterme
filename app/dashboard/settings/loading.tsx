import { SkeletonHeader } from "@/components/ui";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <SkeletonHeader />

        {/* Profile Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-sage/10 shadow-sm mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 skeleton rounded-full" />
            <div className="flex-1">
              <div className="h-6 w-40 skeleton rounded mb-2" />
              <div className="h-4 w-56 skeleton rounded" />
            </div>
            <div className="h-10 w-24 skeleton rounded-lg" />
          </div>
        </div>

        {/* Settings Sections */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-sage/10 shadow-sm mb-6">
            <div className="h-6 w-32 skeleton rounded mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between py-3 border-b border-sage/10 last:border-0">
                  <div>
                    <div className="h-4 w-36 skeleton rounded mb-2" />
                    <div className="h-3 w-48 skeleton rounded" />
                  </div>
                  <div className="h-6 w-12 skeleton rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
