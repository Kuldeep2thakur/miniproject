import type { Trip, User as FirestoreUser } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Calendar, Globe, Lock, Users, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


type TripCardProps = {
  trip: Trip;
};

const VisibilityIcon = ({ visibility }: { visibility: Trip['visibility'] }) => {
  switch (visibility) {
    case 'public':
      return <Globe className="h-4 w-4" />;
    case 'private':
      return <Lock className="h-4 w-4" />;
    case 'shared':
      return <Users className="h-4 w-4" />;
    default:
      return null;
  }
};

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : '';

function SharedWithAvatars({ trip }: { trip: Trip }) {
    const firestore = useFirestore();

    const sharedWithQuery = useMemoFirebase(() => {
        if (!firestore || !trip.sharedWith || trip.sharedWith.length === 0) return null;
        return query(collection(firestore, 'users'), where('__name__', 'in', trip.sharedWith), limit(3));
    }, [firestore, trip.sharedWith]);

    const { data: sharedUsers } = useCollection<FirestoreUser>(sharedWithQuery);

    if (!sharedUsers || sharedUsers.length === 0) {
        return null;
    }

    return (
        <div className="flex -space-x-2">
            <TooltipProvider>
                {sharedUsers.map(user => {
                    const userName = user.displayName || user.email || user.id;

                    return (
                        <Tooltip key={user.id}>
                            <TooltipTrigger asChild>
                                <Avatar className="border-2 border-card h-8 w-8">
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
                 {trip.sharedWith && trip.sharedWith.length > 3 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Avatar className="border-2 border-card h-8 w-8">
                                <AvatarFallback>+{trip.sharedWith.length - 3}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>...and {trip.sharedWith.length - 3} more</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
        </div>
    );
}


export function TripCard({ trip }: TripCardProps) {
  const placeholderPhoto = trip.coverPhotoId ? PlaceHolderImages.find(p => p.id === trip.coverPhotoId) : PlaceHolderImages.find(p => p.id === 'trip-cover-1');
  const coverPhotoURL = trip.coverPhotoURL || placeholderPhoto?.imageUrl;
  const coverPhotoAlt = placeholderPhoto?.description || 'Trip cover image';
  const coverPhotoHint = placeholderPhoto?.imageHint || 'travel landscape';
  
  const { user } = useUser();
  const isOwner = user?.uid === trip.ownerId;


  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
      <CardHeader className="p-0 relative">
        <Link href={`/trips/${trip.id}`}>
          {coverPhotoURL && (
            <Image
              src={coverPhotoURL}
              alt={coverPhotoAlt}
              width={600}
              height={400}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={coverPhotoHint}
            />
          )}
        </Link>
        <Badge variant="secondary" className="absolute top-2 right-2 capitalize flex items-center gap-1.5">
          <VisibilityIcon visibility={trip.visibility} />
          {trip.visibility}
        </Badge>
         {isOwner && <Badge variant="default" className="absolute top-2 left-2">My Trip</Badge>}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-lg mb-2">
            <Link href={`/trips/${trip.id}`} className="hover:text-primary transition-colors">{trip.title}</Link>
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{trip.startDate} - {trip.endDate}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{trip.description}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
         <SharedWithAvatars trip={trip} />
        <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary ml-auto">
            <Link href={`/trips/${trip.id}`}>
                View Trip <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
