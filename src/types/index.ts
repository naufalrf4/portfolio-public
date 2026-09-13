export type {
  AboutData,
  Skill,
  ExperienceItem,
  ExperienceItem as Experience,
  SocialLink,
  Achievement,
  AchievementsResponse,
  GuestbookEntry,
  GuestbookUser,
  GuestbookResponse,
  ContactSubmissionInput,
  BookingAvailability,
  BookingSlotItem,
  BookingSlotItem as BookingSlot,
  BookingSubmissionInput,
  ApiSuccessEnvelope,
  ApiErrorEnvelope,
  ApiEnvelope,
} from '@naufalrf/contracts';

import type { Blog } from '@naufalrf/contracts';
export type BlogLink = Blog;

export interface ProjectImage {
  id: string;
  url: string;
  order: number;
  alt: string | null;
  caption: string | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  content?: string | null;
  category: string;
  techStack: string[] | null;
  liveUrl: string | null;
  repoUrl: string | null;
  imageUrl: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  projectDate?: string | null;
  images: ProjectImage[];
}

export interface ProjectsResponse {
  projects: Project[];
  meta: {
    total: number;
    featured: number;
  };
}

export interface BlogsResponse {
  blogs: BlogLink[];
  meta: { total: number };
}
