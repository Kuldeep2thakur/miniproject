import { TripCard } from "@/components/trip-card";
import { trips } from "@/lib/data";

export default function ExplorePage() {
    const publicTrips = trips.filter(trip => trip.visibility === 'public');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-headline font-bold">Explore Public Trips</h1>
        <p className="text-muted-foreground mt-2">Discover adventures from the WanderLust community.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {publicTrips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
