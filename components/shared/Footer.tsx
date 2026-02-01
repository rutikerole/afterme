import Link from "next/link";
import { Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 border-t border-sage/20 bg-secondary/30 relative overflow-hidden">
      {/* Decorative sage elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sage/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-sage-light/20 rounded-full blur-[80px]" />

      <div className="container mx-auto px-6 relative">
        {/* Main footer content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="font-serif text-xl font-medium text-foreground group-hover:text-sage-dark transition-colors">
                AfterMe
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Preserve your voice, memories, and messages for the people you love.
              Your legacy, protected forever.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-medium text-sage-dark mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-sage-dark transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-sage-dark transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="#security"
                  className="text-sm text-muted-foreground hover:text-sage-dark transition-colors"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-sm text-muted-foreground hover:text-sage-dark transition-colors"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-medium text-sage-dark mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-sage-dark transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-sage-dark transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-sage-dark transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-sage/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AfterMe. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with <Heart className="w-3 h-3 inline text-sage mx-1" /> for families everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
