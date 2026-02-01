import { SkeletonHeader, SkeletonListItem } from "@/components/ui";

export default function SubscriptionsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  );
}
