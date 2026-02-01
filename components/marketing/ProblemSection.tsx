"use client";

import Image from "next/image";
import { Quote } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration with sage */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sage/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Visual Side - Collage */}
          <div className="relative order-2 lg:order-1">
            <div className="relative h-[500px]">
              {/* Main image */}
              <div className="absolute top-0 left-0 w-64 h-72 rounded-2xl overflow-hidden shadow-2xl z-20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1476234251651-f353703a034d?w=400&h=450&fit=crop"
                  alt="Family memories"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Secondary image */}
              <div className="absolute top-20 right-0 w-56 h-64 rounded-2xl overflow-hidden shadow-xl z-10 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=350&h=400&fit=crop"
                  alt="Precious moments"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Third image */}
              <div className="absolute bottom-0 left-20 w-48 h-56 rounded-2xl overflow-hidden shadow-lg z-30 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1517677129300-07b130802f46?w=300&h=350&fit=crop"
                  alt="Love and connection"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 right-1/4 w-20 h-20 border-2 border-sage/20 rounded-full" />
              <div className="absolute bottom-10 -right-4 w-16 h-16 bg-sage-light/30 rounded-full blur-sm" />
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2">
            {/* Quote icon */}
            <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-8">
              <Quote className="w-5 h-5 text-sage" />
            </div>

            {/* Emotional headline */}
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-8 leading-tight">
              Some things should
              <span className="block text-sage">never be forgotten.</span>
            </h2>

            {/* Emotional copy */}
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                The sound of a parent&apos;s laugh. Words of wisdom passed down through generations.
                Messages meant for a future you may not see.
              </p>
              <p>
                Too often, these precious moments fade away. Voices are silenced.
                Stories go untold. Love is left unexpressed.
              </p>
              <p className="text-foreground font-medium text-xl">
                AfterMe ensures they live on — forever.
              </p>
            </div>

            {/* Visual separator */}
            <div className="mt-10 flex items-center gap-3">
              <div className="w-12 h-1 rounded-full bg-sage/30" />
              <div className="w-3 h-3 rounded-full bg-sage/50 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-sage/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
