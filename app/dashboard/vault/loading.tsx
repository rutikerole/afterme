import { SkeletonHeader, SkeletonVaultItem, SkeletonStats } from "@/components/ui";

export default function VaultLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <SkeletonHeader />

        {/* Vault Categories Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-32 skeleton rounded-xl shrink-0" />
          ))}
        </div>

        {/* Stats */}
        <SkeletonStats className="mb-8" />

        {/* Vault Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonVaultItem key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
