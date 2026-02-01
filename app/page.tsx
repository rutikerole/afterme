import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Header, Footer } from "@/components/shared";
import {
  HeroSection,
  ProblemSection,
  FeatureSection,
  HowItWorksSection,
  TrustSection,
  CTASection,
} from "@/components/marketing";

export default async function Home() {
  // Check if user is authenticated
  const user = await getCurrentUser();

  // If authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeatureSection />
        <HowItWorksSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
