'use client';

import { useDoc, useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Trip, Entry, User as TripUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Edit, Globe, Lock, PlusCircle, Users, File } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect } from 'react';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : '';

function SharedWithAvatars({ trip }: { trip: Trip }) {
    const firestore = useFirestore();

    const sharedWithQuery = useMemoFirebase(() => {
        if (!firestore || !trip.sharedWith || trip.sharedWith.length === 0) return null;
        // Firestore 'in' queries are limited to 10 elements. For this UI, we limit to 5.
        return query(collection(firestore, 'users'), where('__name__', 'in', trip.sharedWith.slice(0, 5)));
    }, [firestore, trip.sharedWith]);

    const { data: sharedUsers } = useCollection<TripUser>(sharedWithQuery);

    if (!sharedUsers || sharedUsers.length === 0) {
        return <p className="text-sm text-muted-foreground">Only you</p>;
    }

    return (
        <div className="flex items-center gap-2">
             <div className="flex -space-x-2">
                <TooltipProvider>
                    {sharedUsers.map(user => {
                        const avatar = PlaceHolderImages.find(p => p.id === `avatar-${(parseInt(user.id, 36) % 3) + 1}`);
                        const userName = user.name || user.id;

                        return (
                            <Tooltip key={user.id}>
                                <TooltipTrigger asChild>
                                    <Avatar className="border-2 border-background h-8 w-8">
                                        {avatar && <AvatarImage src={avatar.imageUrl} alt={userName} />}
                                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{userName}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                    {trip.sharedWith && trip.sharedWith.length > 5 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="border-2 border-background h-8 w-8">
                                    <AvatarFallback>+{trip.sharedWith.length - 5}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>...and {trip.sharedWith.length - 5} more</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </TooltipProvider>
            </div>
            <span className="text-sm text-muted-foreground">
                {trip.sharedWith.length} member{trip.sharedWith.length > 1 ? 's' : ''}
            </span>
        </div>
    );
}

const VisibilityIcon = ({ visibility }: { visibility: Trip['visibility'] }) => {
  const iconProps = { className: "h-4 w-4 mr-2" };
  switch (visibility) {
    case 'public':
      return <><Globe {...iconProps} /> Public</>;
    case 'private':
      return <><Lock {...iconProps} /> Private</>;
    case 'shared':
      return <><Users {...iconProps} /> Shared</>;
    default:
      return null;
  }
};


export default function TripPage() {
    const { tripId } = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const tripRef = useMemoFirebase(() => {
        if (!firestore || !tripId) return null;
        return doc(firestore, 'trips', tripId as string);
    }, [firestore, tripId]);

    const { data: trip, isLoading: isLoadingTrip } = useDoc<Trip>(tripRef);

    const entriesQuery = useMemoFirebase(() => {
        if (!tripRef) return null;
        return query(collection(tripRef, 'entries'), orderBy('visitedAt', 'desc'));
    }, [tripRef]);
    
    const { data: entries, isLoading: isLoadingEntries } = useCollection<Entry>(entriesQuery);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const coverPhoto = trip ? PlaceHolderImages.find(p => p.id === trip.coverPhotoId) : null;

    if (isLoadingTrip || isUserLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <Skeleton className="h-12 w-48 mb-8" />
                <Skeleton className="w-full h-96 rounded-2xl mb-6" />
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-4/5" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold">Trip not found</h2>
                <p className="text-muted-foreground mt-2">The trip you are looking for does not exist or you do not have permission to view it.</p>
                <Button asChild className="mt-6">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        );
    }
    
    const isOwner = user?.uid === trip.ownerId;

    return (
        <div className="min-h-screen">
             <header className="relative h-64 md:h-80 w-full">
                {coverPhoto && (
                    <Image
                        src={coverPhoto.imageUrl}
                        alt={coverPhoto.description}
                        fill
                        className="object-cover"
                        priority
                        data-ai-hint={coverPhoto.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 sm:p-6 lg:p-8 text-white">
                    <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{trip.title}</h1>
                    <p className="flex items-center text-lg mt-2 text-gray-200">
                        <Calendar className="h-5 w-5 mr-2" />
                        {trip.startDate} - {trip.endDate}
                    </p>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="secondary" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Edit Trip
                    </Button>
                </div>
                 <div className="absolute top-4 left-4">
                    <Button variant="secondary" size="sm" asChild>
                        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                    </Button>
                </div>
            </header>
            <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                             <h2 className="text-2xl font-bold font-headline">Trip Diary</h2>
                             {(isOwner || (trip.visibility === 'shared' && trip.sharedWith?.includes(user!.uid))) && (
                                <Button asChild>
                                    <Link href={`/trips/${tripId}/new`}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Entry
                                    </Link>
                                </Button>
                             )}
                        </div>

                        {isLoadingEntries ? (
                            <div className="space-y-6">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
                            </div>
                        ) : entries && entries.length > 0 ? (
                            <div className="space-y-6">
                                {entries.map(entry => {
                                     const visitedDate = entry.visitedAt instanceof Date 
                                        ? entry.visitedAt
                                        : (entry.visitedAt as any)?.toDate?.() || new Date(entry.visitedAt as string);

                                    return (
                                        <div key={entry.id} className="bg-card p-4 rounded-lg shadow-sm border space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">{entry.title}</h3>
                                                <p className="text-sm text-muted-foreground mb-2">{format(visitedDate, 'PPP')}</p>
                                                <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                                            </div>
                                            {entry.media && entry.media.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-2">Media</h4>
                                                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                        {entry.media.map((mediaFile, index) => {
                                                            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(mediaFile);
                                                            // In a real app, you'd have actual URLs from a storage service
                                                            const mediaUrl = `https://picsum.photos/seed/${entry.id}-${index}/200/200`;

                                                            return (
                                                                <div key={index} className="aspect-square rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                                                    {isImage ? (
                                                                         <Image 
                                                                            src={mediaUrl} 
                                                                            alt={`Media for ${entry.title}`}
                                                                            width={200}
                                                                            height={200}
                                                                            className="object-cover w-full h-full"
                                                                            data-ai-hint="travel photo"
                                                                        />
                                                                    ) : (
                                                                        <div className="text-center p-2">
                                                                            <File className="h-8 w-8 mx-auto text-muted-foreground" />
                                                                            <p className="text-xs text-muted-foreground truncate mt-1">{mediaFile}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                <h2 className="text-xl font-semibold">No entries yet!</h2>
                                <p className="text-muted-foreground mt-2 mb-6">Start your diary by adding your first entry.</p>
                                <Button asChild>
                                    <Link href={`/trips/${tripId}/new`}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add First Entry
                                    </Link>
                                </Button>
                            </div>
                        )}

                    </div>
                     <aside className="space-y-6">
                        <div className="bg-card p-4 rounded-lg shadow-sm border">
                            <h3 className="font-semibold font-headline mb-3">About this trip</h3>
                            <p className="text-sm text-muted-foreground">{trip.description}</p>
                        </div>
                        <div className="bg-card p-4 rounded-lg shadow-sm border">
                            <h3 className="font-semibold font-headline mb-3">Visibility</h3>
                            <p className="flex items-center capitalize text-sm">
                                <VisibilityIcon visibility={trip.visibility} />
                            </p>
                        </div>
                        <div className="bg-card p-4 rounded-lg shadow-sm border">
                            <h3 className="font-semibold font-headline mb-3">Shared With</h3>
                            <SharedWithAvatars trip={trip} />
                        </div>
                    </aside>
                </div>

            </main>

        </div>
    );
}
