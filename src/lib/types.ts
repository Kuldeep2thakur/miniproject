import { DocumentReference } from "firebase/firestore";

export type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate:string;
  description: string;
  coverPhotoId: string;
  visibility: 'private' | 'public' | 'shared';
  sharedWith?: User[];
  ownerId?: string;
  tripRef?: DocumentReference
};

export type User = {
  id: string;
  name: string;
  avatarId: string;
};
