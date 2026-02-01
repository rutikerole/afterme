import { SkeletonHeader, SkeletonVaultItem } from "@/components/ui";

export default function InsuranceLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonVaultItem key={i} />
        ))}
      </div>
    </div>
  );
}
