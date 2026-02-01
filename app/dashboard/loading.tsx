export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 relative overflow-hidden">
      {/* Decorative Background - Static version */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-sage/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-sage-light/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative z-10 p-8">
        {/* Header Skeleton */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-8 w-48 bg-sage/10 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-sage/5 rounded animate-pulse" />
            </div>
            <div className="h-12 w-12 bg-sage/10 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-sage/10 shadow-sm"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sage/10 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-20 bg-sage/5 rounded animate-pulse" />
                    <div className="h-6 w-12 bg-sage/10 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-sage/10 shadow-sm"
              >
                {/* Card Image Skeleton */}
                <div className="h-40 bg-sage/10 animate-pulse" />

                {/* Card Content Skeleton */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sage/10 rounded-xl animate-pulse" />
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-sage/10 rounded animate-pulse mb-2" />
                      <div className="h-3 w-24 bg-sage/5 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-sage/5 rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-sage/5 rounded animate-pulse" />
                  </div>
                  <div className="pt-4 border-t border-sage/10">
                    <div className="h-10 w-full bg-sage/10 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Loading Indicator */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-sage/20">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-sage rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-sm text-sage-dark">Loading your memories...</span>
        </div>
      </div>
    </div>
  );
}
