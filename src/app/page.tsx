import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Camera, Map, Share2, Sparkles } from 'lucide-react';
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

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[75vh] flex items-center justify-center text-center">
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
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 container px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                WanderLust
              </h1>
              <p className="text-lg text-gray-200 md:text-xl">
                Your Digital Travel Diary. Beautifully simple, powerfully personal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    {feature.icon}
                    <h3 className="text-xl font-headline font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
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
