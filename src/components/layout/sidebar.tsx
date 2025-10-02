
'use client';

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Globe, LayoutDashboard, LogOut, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { users } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const currentUser = users[0];
const userAvatar = PlaceHolderImages.find(p => p.id === currentUser.avatarId);

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/explore', label: 'Explore', icon: Globe },
];

export function AppSidebar() {
  const pathname = usePathname();
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span className="font-headline text-xl font-semibold">WanderLust</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="gap-0">
        <Separator className="mb-2" />
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/profile" passHref legacyBehavior>
                    <SidebarMenuButton isActive={pathname === '/profile'} tooltip="Profile">
                        <UserIcon/>
                        <span>Profile</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="#" passHref legacyBehavior>
                    <SidebarMenuButton tooltip="Settings">
                        <Settings/>
                        <span>Settings</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
        <Separator className="my-2" />
        <div className="p-2 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={currentUser.name} />}
            <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium truncate">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground truncate">asha@example.com</span>
          </div>
          <Button asChild variant="ghost" size="icon" className="ml-auto flex-shrink-0">
            <Link href="/"><LogOut /></Link>
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
