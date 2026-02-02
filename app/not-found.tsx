import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* 404 Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sage/20 to-sage-light/30 flex items-center justify-center border-2 border-sage/20">
          <span className="text-4xl font-serif text-sage-dark">404</span>
        </div>

        <h1 className="text-2xl font-serif font-medium text-stone-800 mb-3">
          Page Not Found
        </h1>

        <p className="text-stone-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-sage text-white rounded-xl hover:bg-sage-dark transition-colors"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="px-6 py-3 bg-white text-sage border border-sage/20 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
