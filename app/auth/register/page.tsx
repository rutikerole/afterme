import { RegisterForm } from "@/components/auth/RegisterForm";
import { Heart } from "lucide-react";

export const metadata = {
  title: "Create Account | AfterMe",
  description: "Create your AfterMe account and start preserving your digital legacy for loved ones.",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sage/20 to-sage-light/30 mb-2">
          <Heart className="w-8 h-8 text-sage" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Begin your legacy
        </h1>
        <p className="text-muted-foreground">
          Create an account to start preserving what matters most
        </p>
      </div>

      {/* Form Card */}
      <div className="relative">
        {/* Card glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-sage/20 via-sage-light/10 to-sage/20 rounded-3xl blur-lg opacity-50" />

        <div className="relative bg-white/80 backdrop-blur-sm border border-sage/20 rounded-2xl p-8 shadow-xl shadow-sage/5">
          <RegisterForm />
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage" />
          <span>Secure</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage" />
          <span>Private</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage" />
          <span>Encrypted</span>
        </div>
      </div>
    </div>
  );
}
