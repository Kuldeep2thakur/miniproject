'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Camera, Map, Share2, Sparkles, Users, Route, Globe2, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: <Camera className="h-8 w-8 text-primary" />,
    title: 'Multimedia Entries',
    description: 'Attach photos and videos to bring your travel stories to life.',
  },
  {
    icon: <Map className="h-8 w-8 text-primary" />,
    title: 'Route Visualization',
    description: 'See your journey unfold on an interactive map.',
  },
  {
    icon: <Share2 className="h-8 w-8 text-primary" />,
    title: 'Selective Sharing',
    description: 'Keep your diaries private or share your adventures with friends and family.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'AI Suggestions',
    description: 'Get AI-powered recommendations for your next destination.',
  },
];

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    let ctx: any;
    (async () => {
      const { gsap } = await import('gsap');
      if (!rootRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo('.hero-title', { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' })
        .fromTo('.hero-subtitle', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
        .fromTo('.hero-badge', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }, '-=0.3')
        .fromTo('.hero-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.1 }, '-=0.3')
        .fromTo('.hero-stats', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08 }, '-=0.2')
        .fromTo('.scroll-indicator', { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2');
      
      // Floating animation for gradient blobs
      gsap.to('.blob-1', { y: 30, x: 20, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.blob-2', { y: -30, x: -20, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      
      ctx = gsap.context(() => {
        const cards = rootRef.current!.querySelectorAll('.feature-card');
        if (cards.length) {
          gsap.set(cards, { y: 30, opacity: 0, scale: 0.95 });
          gsap.to(cards, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.3 });
        }
      }, rootRef);
    })();
    return () => ctx?.revert?.();
  }, []);

  return (
    <div ref={rootRef} className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center text-center overflow-hidden">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
          <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/40 blur-3xl opacity-60 blob-1" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/40 blur-3xl opacity-60 blob-2" />
          <div className="relative z-10 container px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="hero-title font-headline text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-2xl">
                <span className="inline-block hover:scale-110 transition-transform duration-300">Wander</span>
                <span className="inline-block hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Lust</span>
              </h1>
              <p className="hero-subtitle text-lg text-gray-200 md:text-xl drop-shadow-lg">
                Your Digital Travel Diary. <span className="font-semibold text-white">Beautifully simple</span>, powerfully personal.
              </p>
              <div className="flex items-center justify-center gap-2 hero-badge">
                <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-default">
                  <Sparkles className="mr-1.5 h-4 w-4 text-primary animate-pulse" /> AI‑powered planning
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="hero-cta bg-accent hover:bg-accent/90 text-accent-foreground hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
                  <Link href="/signup">
                    Get Started
                    <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="hero-cta hover:scale-105 hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
              <div className="mx-auto grid grid-cols-3 gap-4 pt-2 text-gray-200">
                <div className="hero-stats flex items-center justify-center gap-2 hover:scale-110 transition-transform duration-300 cursor-default">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-sm"><span className="font-bold text-white">10k+</span> travelers</div>
                </div>
                <div className="hero-stats flex items-center justify-center gap-2 hover:scale-110 transition-transform duration-300 cursor-default">
                  <Route className="h-5 w-5 text-primary" />
                  <div className="text-sm"><span className="font-bold text-white">25k+</span> routes</div>
                </div>
                <div className="hero-stats flex items-center justify-center gap-2 hover:scale-110 transition-transform duration-300 cursor-default">
                  <Globe2 className="h-5 w-5 text-primary" />
                  <div className="text-sm"><span className="font-bold text-white">120+</span> countries</div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 scroll-indicator">
            <Link href="#features" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-bounce">
              <ChevronDown className="h-6 w-6" />
            </Link>
          </div>
        </section>
        <section id="features" className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="feature-card bg-card/80 backdrop-blur-sm border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 group-hover:rotate-6 transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-headline font-semibold group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WanderLust. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

