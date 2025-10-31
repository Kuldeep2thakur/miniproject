
'use client';

import { useDoc, useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { doc, collection, query, orderBy, where } from 'firebase/firestore';
import { Trip, Entry, User as TripUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MediaDisplay } from '@/components/media-display';
import { MapView } from '@/components/map-view';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Edit, Globe, Lock, MapPin, PlusCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : '';

function AuthorAvatar({ authorId }: { authorId: string }) {
    const firestore = useFirestore();
    const authorRef = useMemoFirebase(() => {
        if (!firestore || !authorId) return null;
        return doc(firestore, 'users', authorId);
    }, [firestore, authorId]);
    const { data: author, isLoading } = useDoc<TripUser>(authorRef);

    if (isLoading) {
        return <Skeleton className="h-6 w-6 rounded-full" />;
    }

    if (!author) {
        return null;
    }

    const authorName = author.displayName || author.email || author.id;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Avatar className="h-6 w-6">
                        {author.photoURL && <AvatarImage src={author.photoURL} alt={authorName} />}
                        <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
                    </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{authorName}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function SharedWithAvatars({ trip }: { trip: Trip }) {
    const firestore = useFirestore();

    const sharedWithQuery = useMemoFirebase(() => {
        if (!firestore || !trip.sharedWith || trip.sharedWith.length === 0) return null;
        // Firestore 'in' queries are limited to 30 elements in total for a single query.
        return query(collection(firestore, 'users'), where('__name__', 'in', trip.sharedWith.slice(0, 30)));
    }, [firestore, trip.sharedWith]);

    const { data: sharedUsers } = useCollection<TripUser>(sharedWithQuery);

    if (!sharedUsers || sharedUsers.length === 0) {
        return <p className="text-sm text-muted-foreground">Only you</p>;
    }

    return (
        <div className="flex items-center gap-2">
             <div className="flex -space-x-2">
                <TooltipProvider>
                    {sharedUsers.slice(0,5).map(user => {
                        const userName = user.displayName || user.email || user.id;

                        return (
                            <Tooltip key={user.id}>
                                <TooltipTrigger asChild>
                                    <Avatar className="border-2 border-background h-8 w-8">
                                        {user.photoURL && <AvatarImage src={user.photoURL} alt={userName} />}
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
        if (!firestore || !tripId || !user) return null;
        return doc(firestore, `users/${user.uid}/trips`, tripId as string);
    }, [firestore, tripId, user]);

    const { data: trip, isLoading: isLoadingTrip } = useDoc<Trip>(tripRef);

    const entriesQuery = useMemoFirebase(() => {
        if (!tripRef || !user) return null;
        return query(collection(firestore, `users/${user.uid}/trips/${tripId}/entries`), orderBy('visitedAt', 'desc'));
    }, [tripRef, user, firestore, tripId]);
    
    const { data: entries, isLoading: isLoadingEntries } = useCollection<Entry>(entriesQuery);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const placeholderPhoto = trip?.coverPhotoId ? PlaceHolderImages.find(p => p.id === trip.coverPhotoId) : PlaceHolderImages.find(p => p.id === 'trip-cover-1');
    const coverPhotoURL = trip?.coverPhotoURL || placeholderPhoto?.imageUrl;
    const coverPhotoAlt = placeholderPhoto?.description || 'Trip cover image';
    const coverPhotoHint = placeholderPhoto?.imageHint || 'travel landscape';

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
    const canAddEntry = isOwner || (trip.visibility === 'shared' && trip.sharedWith?.includes(user?.uid || ''));

    return (
        <div className="min-h-screen">
             <header className="relative h-64 md:h-80 w-full">
                {coverPhotoURL && (
                    <Image
                        src={coverPhotoURL}
                        alt={coverPhotoAlt}
                        fill
                        className="object-cover"
                        priority
                        data-ai-hint={coverPhotoHint}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 sm:p-6 lg:p-8 text-white">
                    <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{trip.title}</h1>
                    <div className="flex items-center text-lg mt-2 text-gray-200">
                        <Calendar className="h-5 w-5 mr-2" />
                        {trip.startDate instanceof Date ? format(trip.startDate, 'MMM dd, yyyy') : trip.startDate} - {trip.endDate instanceof Date ? format(trip.endDate, 'MMM dd, yyyy') : trip.endDate}
                    </div>
                </div>
                {isOwner && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Button variant="secondary" size="sm">
                            <Edit className="mr-2 h-4 w-4" /> Edit Trip
                        </Button>
                    </div>
                )}
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
                             {canAddEntry && (
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
                                    
                                    const canEditEntry = isOwner || (entry.authorId === user?.uid);

                                    return (
                                        <div key={entry.id} className="bg-card p-4 rounded-lg shadow-sm border space-y-4">
                                            <div className="space-y-4">
                                                {entry.media && entry.media.length > 0 && (
                                                    <MediaDisplay media={entry.media} title={entry.title} />
                                                )}
                                                {entry.location && (
                                                    <MapView location={entry.location} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{entry.title}</h3>
                                                        <div className="text-sm text-muted-foreground mb-2 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                {format(visitedDate, 'PPP')}
                                                                {entry.authorId && (
                                                                    <>
                                                                        <span>&middot;</span>
                                                                        <AuthorAvatar authorId={entry.authorId} />
                                                                    </>
                                                                )}
                                                            </div>
                                                            {entry.location && (
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="h-4 w-4" />
                                                                    {entry.location.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                     {canEditEntry && (
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/trips/${tripId}/entries/${entry.id}/edit`}>
                                                                <Edit className="h-3 w-3 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                     )}
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                <h2 className="text-xl font-semibold">No entries yet!</h2>
                                <p className="text-muted-foreground mt-2 mb-6">Start your diary by adding your first entry.</p>
                                {canAddEntry && (
                                    <Button asChild>
                                        <Link href={`/trips/${tripId}/new`}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add First Entry
                                        </Link>
                                    </Button>
                                )}
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
