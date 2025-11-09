'use client';
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { PlusCircle, Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { collection, query } from "firebase/firestore";
import Link from "next/link";
import { Trip } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function TripsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const tripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        // Query the current user's trips under users/{userId}/trips
        return query(collection(firestore, `users/${user.uid}/trips`));
    }, [user, firestore]);

    const { data: trips, isLoading: isLoadingTrips } = useCollection<Trip>(tripsQuery);

    const [q, setQ] = useState("");
    const myTrips = trips;
    const filteredTrips = useMemo(() => {
        if (!myTrips) return myTrips;
        if (!q.trim()) return myTrips;
        const needle = q.toLowerCase();
        return myTrips.filter(t =>
            (t.title || "").toLowerCase().includes(needle) ||
            (t.description || "").toLowerCase().includes(needle)
        );
    }, [myTrips, q]);

    if (isUserLoading || isLoadingTrips) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-headline font-bold">All Trips</h1>
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Trip
                    </Button>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[200px] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

  return (
    <div className="pb-8 min-h-screen bg-gradient-to-b from-background to-muted/40">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-accent/10 to-transparent" />
        <section className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-headline font-bold">All Trips</h1>
              <p className="text-muted-foreground mt-1">Browse and manage all your travel adventures.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative hidden sm:block">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search trips..."
                  className="pl-9 w-64"
                />
              </div>
              <Button asChild variant="outline">
                <Link href="/map">
                  <MapPin className="mr-2 h-4 w-4" />
                  Map View
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Trip
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-3 sm:hidden">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search trips..." className="pl-9" />
            </div>
          </div>
        </section>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {filteredTrips && filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTrips.map(trip => (
              <div key={trip.id} className="trip-card-anim will-change-transform">
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold">No trips found</h2>
            <p className="text-muted-foreground mt-2 mb-6">{q ? 'Try a different keyword.' : 'Start your next adventure by creating a new trip.'}</p>
            <Button asChild>
              <Link href="/dashboard/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Trip
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
