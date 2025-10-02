export type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  coverPhotoId: string;
  visibility: 'private' | 'public' | 'shared';
  sharedWith?: User[];
};

export type User = {
  id: string;
  name: string;
  avatarId: string;
};
