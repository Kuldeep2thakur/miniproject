'use client';
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { trips } from "@/lib/data";
import { useUser } from "@/firebase";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const myTrips = trips.filter(trip => trip.visibility === 'private' || trip.visibility === 'shared');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-headline font-bold">My Trips</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {myTrips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
