import { SkeletonHeader, SkeletonCard, SkeletonListItem } from "@/components/ui";

export default function EmergencyLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />

      {/* Emergency Contacts */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>

      {/* Medical Info Card */}
      <SkeletonCard />
    </div>
  );
}
