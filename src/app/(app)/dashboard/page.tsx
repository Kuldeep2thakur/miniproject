'use client';
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { PlusCircle, Map, Calendar, TrendingUp, ArrowRight, FileText, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { collection, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { Trip } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    // Fetch all trips to get total count
    const allTripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/trips`));
    }, [user, firestore]);

    const { data: allTrips, isLoading: isLoadingAllTrips } = useCollection<Trip>(allTripsQuery);

    // Fetch recent trips for display
    const recentTripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, `users/${user.uid}/trips`),
            orderBy('createdAt', 'desc'),
            limit(6)
        );
    }, [user, firestore]);

    const { data: recentTrips, isLoading: isLoadingRecentTrips } = useCollection<Trip>(recentTripsQuery);

    // Calculate statistics from trips data
    const stats = useMemo(() => {
        const totalTrips = allTrips?.length || 0;
        
        // Count entries by fetching from each trip (we'll do this more efficiently)
        // For now, we'll estimate or you can add entry count to trip document
        const totalEntries = 0; // We'll calculate this differently
        
        // Get unique locations from trips
        const uniqueLocations = new Set(
            allTrips?.filter(trip => trip.location?.name).map(trip => trip.location!.name)
        ).size || 0;

        return {
            totalTrips,
            totalEntries,
            uniqueLocations
        };
    }, [allTrips]);

    const isLoading = isUserLoading || isLoadingAllTrips || isLoadingRecentTrips;

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Welcome back!</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
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
              <h1 className="text-3xl sm:text-4xl font-headline font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user?.displayName || 'Traveler'}!</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Trip
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrips}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalTrips === 1 ? 'travel adventure' : 'travel adventures'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalEntries === 1 ? 'memory captured' : 'memories captured'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations Visited</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueLocations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.uniqueLocations === 1 ? 'unique destination' : 'unique destinations'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trips Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-headline font-bold">Recent Trips</h2>
              <p className="text-muted-foreground text-sm mt-1">Your latest adventures</p>
            </div>
            {stats.totalTrips > 0 && (
              <Button asChild variant="ghost">
                <Link href="/trips" className="group">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </div>

          {recentTrips && recentTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTrips.map(trip => (
                <div key={trip.id} className="trip-card-anim will-change-transform">
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h2 className="text-2xl font-semibold">No trips yet</h2>
              <p className="text-muted-foreground mt-2 mb-6">Start your next adventure by creating a new trip.</p>
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
    </div>
  );
}
