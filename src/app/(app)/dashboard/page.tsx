'use client';
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { collection, query, where } from "firebase/firestore";
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

    const tripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'trips'), where('ownerId', '==', user.uid));
    }, [user, firestore]);

    const { data: trips, isLoading: isLoadingTrips } = useCollection<Trip>(tripsQuery);

    const myTrips = trips;

    if (isUserLoading || isLoadingTrips) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-headline font-bold">My Trips</h1>
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
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-headline font-bold">My Trips</h1>
        <Button asChild>
          <Link href="/dashboard/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Trip
          </Link>
        </Button>
      </header>

      {myTrips && myTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
            ))}
        </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-semibold">No trips yet!</h2>
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
  );
}
