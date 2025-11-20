import React from 'react';
import {
    HomeIcon,
    CalendarIcon,
    UsersIcon,
    UserIcon,
    PhotoIcon,
    ChatBubbleLeftRightIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    TrophyIcon,
    InboxIcon,
    VideoCameraIcon,
    MicrophoneIcon,
    ShieldCheckIcon
  } from '@heroicons/react/24/outline';
  
  export interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    permission?: { resource: string; action: string }; // Optioneel: nodig om dit te zien
    role?: string; // Optioneel: specifieke rol nodig
    menuItem?: string; // Optioneel: menu item identifier voor menu permissions
  }

  export interface NavGroup {
    label: string;
    items: NavItem[];
    permissions?: { resource: string; action: string }[]; // Optioneel: permissies voor de hele groep
    role?: string; // Optioneel: specifieke rol voor de groep
  }
  
  export const navigation: NavGroup[] = [
    {
      label: 'Main',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: HomeIcon,
          menuItem: 'dashboard'
        }
      ]
    },
    {
      label: 'Management',
      items: [
        {
          name: 'Evenementen',
          href: '/events',
          icon: CalendarIcon,
          permission: { resource: 'event', action: 'read' },
          menuItem: 'events'
        },
        {
          name: 'Deelnemers',
          href: '/participants',
          icon: UsersIcon,
          permission: { resource: 'participant', action: 'read' },
          menuItem: 'participants'
        },
        {
          name: 'Gebruikers',
          href: '/users',
          icon: UserIcon,
          permission: { resource: 'user', action: 'read' },
          menuItem: 'users'
        }
      ]
    },
    {
      label: 'Content & Media',
      items: [
        {
          name: 'Gamification',
          href: '/gamification',
          icon: TrophyIcon,
          permission: { resource: 'gamification', action: 'read' },
          menuItem: 'gamification'
        },
        {
          name: 'Partners & Sponsors',
          href: '/cms/partners',
          icon: PhotoIcon,
          permission: { resource: 'cms', action: 'read' },
          menuItem: 'cms_partners'
        },
        {
          name: 'Albums',
          href: '/cms/albums',
          icon: PhotoIcon,
          permission: { resource: 'cms', action: 'read' },
          menuItem: 'cms_albums'
        },
        {
          name: 'CMS & Media',
          href: '/cms',
          icon: PhotoIcon,
          permission: { resource: 'cms', action: 'read' },
          menuItem: 'cms'
        },
        {
          name: "Video's",
          href: '/cms/videos',
          icon: VideoCameraIcon,
          permission: { resource: 'video', action: 'read' },
          menuItem: 'cms_videos'
        },
        {
          name: 'Radio',
          href: '/cms/radio',
          icon: MicrophoneIcon,
          permission: { resource: 'radio_recording', action: 'read' },
          menuItem: 'cms_radio'
        }
      ]
    },
    {
      label: 'Communication',
      items: [
        {
          name: 'Chat',
          href: '/communication/chat',
          icon: ChatBubbleLeftRightIcon,
          permission: { resource: 'chat', action: 'read' },
          menuItem: 'communication_chat'
        },
        {
          name: 'Notulen',
          href: '/communication/notulen',
          icon: DocumentTextIcon,
          permission: { resource: 'notulen', action: 'read' },
          menuItem: 'communication_notulen'
        },
        {
          name: 'Email',
          href: '/communication/email',
          icon: InboxIcon,
          permission: { resource: 'email', action: 'read' },
          menuItem: 'communication_email'
        }
      ]
    },
    {
      label: 'Administration',
      items: [
        {
          name: 'Instellingen',
          href: '/settings',
          icon: Cog6ToothIcon,
          role: 'admin',
          menuItem: 'settings'
        },
        {
          name: 'Rollen',
          href: '/rbac/roles',
          icon: ShieldCheckIcon,
          role: 'admin',
          menuItem: 'rbac_roles'
        },
        {
          name: 'Permissies',
          href: '/rbac/permissions',
          icon: ShieldCheckIcon,
          role: 'admin',
          menuItem: 'rbac_permissions'
        }
      ],
      role: 'admin'
    }
  ];