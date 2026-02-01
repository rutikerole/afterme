import { getCurrentUser } from "@/lib/auth";
import { InteractiveDashboard } from "@/components/dashboard/InteractiveDashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userName = user?.name || "Friend";

  return <InteractiveDashboard userName={userName} />;
}
