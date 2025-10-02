import type { Trip } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Calendar, Globe, Lock, Users, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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

export function TripCard({ trip }: TripCardProps) {
  const coverPhoto = PlaceHolderImages.find(p => p.id === trip.coverPhotoId);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
      <CardHeader className="p-0 relative">
        <Link href={`/trips/${trip.id}`} className="block">
          {coverPhoto && (
            <Image
              src={coverPhoto.imageUrl}
              alt={coverPhoto.description}
              width={600}
              height={400}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={coverPhoto.imageHint}
            />
          )}
        </Link>
        <Badge variant="secondary" className="absolute top-2 right-2 capitalize flex items-center gap-1.5">
          <VisibilityIcon visibility={trip.visibility} />
          {trip.visibility}
        </Badge>
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
        <div className="flex items-center">
          {trip.sharedWith && trip.sharedWith.length > 0 && (
            <div className="flex -space-x-2">
              <TooltipProvider>
                {trip.sharedWith.map(user => {
                    const avatar = PlaceHolderImages.find(p => p.id === user.avatarId);
                    return (
                        <Tooltip key={user.id}>
                            <TooltipTrigger asChild>
                                <Avatar className="border-2 border-card h-8 w-8">
                                    {avatar && <AvatarImage src={avatar.imageUrl} alt={user.name} />}
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{user.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
              </TooltipProvider>
            </div>
          )}
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
            <Link href={`/trips/${trip.id}`}>
                View Trip <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
