import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-sage" />
        </div>
        <h1 className="font-serif text-3xl text-charcoal mb-4">
          You&apos;re Offline
        </h1>
        <p className="text-charcoal/70 mb-8">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry, your memories are safe. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-6 py-3 bg-sage text-white rounded-xl font-medium hover:bg-sage-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
