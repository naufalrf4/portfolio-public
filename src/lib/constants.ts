import {
  Home,
  User,
  FolderKanban,
  FileText,
  Mail,
  MoreHorizontal,
  MessageCircleQuestion,
  Link2,
  Bot,
  Briefcase,
} from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: User },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/publications', label: 'Publication', icon: FileText },
  { href: '/contact', label: 'Contact', icon: Mail },
] as const;

export const OTHER_LINKS = [
  { href: '/services', label: 'Services', icon: Briefcase, external: false },
  { href: '/ai-chatbot', label: 'AI Assistant', icon: Bot, external: false },
  { href: 'https://ngl.naufalrf.net', label: 'NGL', icon: MessageCircleQuestion, external: true },
  { href: 'https://links.naufalrf.net', label: 'Links', icon: Link2, external: true },
] as const;

export const MOBILE_NAV_ITEMS = [
  ...NAV_ITEMS,
  { href: '#other', label: 'Other', icon: MoreHorizontal },
] as const;
