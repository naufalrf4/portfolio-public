import { createAbortSignal, createLogger, createLogShipper, HttpError, isAbortError, isSuccessEnvelope } from '@naufalrf/http';
import type {
  ProjectsResponse,
  Project,
  BlogsResponse,
  AboutData,
  AchievementsResponse,
  GuestbookResponse,
  ContactSubmissionInput,
  BookingAvailability,
  BookingSubmissionInput,
} from '../types';
import type { LogEntryInput } from '@naufalrf/contracts';
import { MOCK_ABOUT, MOCK_ACHIEVEMENTS, MOCK_BLOGS, MOCK_GUESTBOOK, MOCK_PROJECTS } from './mock-data';

const API_BASE =
  (typeof process !== 'undefined' ? process.env.ADMIN_API_URL?.trim() : undefined) ||
  import.meta.env.ADMIN_API_URL?.trim() ||
  'http://localhost:3001';
const API_TIMEOUT_MS = 5000;

const USE_MOCK =
  (typeof process !== 'undefined' ? process.env.PUBLIC_MOCK_DATA?.trim() : undefined) === 'true' ||
  import.meta.env.PUBLIC_MOCK_DATA?.trim() === 'true';

const ADMIN_INTERNAL_API_TOKEN =
  (typeof process !== 'undefined' ? process.env.ADMIN_INTERNAL_API_TOKEN?.trim() : undefined) ||
  import.meta.env.ADMIN_INTERNAL_API_TOKEN?.trim() ||
  (typeof process !== 'undefined' ? process.env.ADMIN_SERVICE_TOKEN?.trim() : undefined) ||
  import.meta.env.ADMIN_SERVICE_TOKEN?.trim() ||
  '';

function createPublicApiSink(): ((entry: LogEntryInput) => void) | undefined {
  if (!ADMIN_INTERNAL_API_TOKEN) return undefined;
  const shipper = createLogShipper({
    endpoint: `${API_BASE}/api/v1/internal/logs`,
    token: ADMIN_INTERNAL_API_TOKEN,
  });
  return (entry) => shipper.enqueue(entry);
}

export const logger = createLogger({
  service: 'public-astro',
  sink: createPublicApiSink(),
});

// Real profile URLs referenced elsewhere in this codebase (see
// src/lib/mock-data.ts). Used so `about.socialLinks` is never completely
// empty even when the CMS is unreachable and the hard fallback kicks in.
const FALLBACK_SAME_AS: string[] = [
  'https://github.com/naufalrf',
  'https://linkedin.com/in/naufalrf',
  'https://twitter.com/naufalrf',
];

const FALLBACK_ABOUT: AboutData = {
  fullName: 'Naufal Rizqullah Firdaus',
  tagline: null,
  roles: [],
  shortBio: null,
  bio: '',
  email: '',
  location: null,
  avatarUrl: null,
  resumeUrl: null,
  availabilityStatus: null,
  skills: [],
  experience: [],
  socialLinks: FALLBACK_SAME_AS.map((url) => ({
    platform: new URL(url).hostname.replace(/^www\./, '').split('.')[0],
    url,
  })),
  updatedAt: '',
};

/**
 * Thrown by fetch functions below when the upstream Admin API is unreachable
 * or errors out, as opposed to genuinely returning an empty result. Callers
 * (Astro pages) can catch this specifically to distinguish "nothing to show"
 * from "we couldn't ask", and respond with a 503 instead of silently
 * rendering an empty shell as a 200.
 */
export class ApiFetchFailedError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ApiFetchFailedError';
  }
}

class ApiClientError extends HttpError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'ApiClientError';
  }
}

async function apiFetch<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const { signal, cleanup } = createAbortSignal(API_TIMEOUT_MS);

  try {
    const response = await fetch(url, { headers, signal });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const json: unknown = await response.json();
    if (isSuccessEnvelope<T>(json)) return json.data;
    return json as T;
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiClientError(`Admin API request timed out for ${endpoint}`, error);
    }
    if (error instanceof SyntaxError) {
      throw new ApiClientError(`Failed to parse JSON response from ${endpoint}`, error);
    }
    throw error;
  } finally {
    cleanup();
  }
}

type FetchRequestInit = Parameters<typeof fetch>[1];

async function localApiFetch<T>(endpoint: string, init?: FetchRequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const json = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: T;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(json?.error?.message || `Request failed: ${response.status} ${response.statusText}`);
  }

  if (isSuccessEnvelope<T>(json)) return json.data;
  return json as T;
}

async function requestProjects(params?: {
  featured?: boolean;
  category?: string;
  limit?: number;
}): Promise<ProjectsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString());
  if (params?.category) searchParams.set('category', params.category);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  const endpoint = query ? `/api/v1/public/projects?${query}` : '/api/v1/public/projects';
  return apiFetch<ProjectsResponse>(endpoint);
}

export async function getProjects(params?: {
  featured?: boolean;
  category?: string;
  limit?: number;
}): Promise<ProjectsResponse> {
  if (USE_MOCK) {
    let projects = MOCK_PROJECTS;
    if (params?.featured !== undefined) projects = projects.filter((p) => p.featured === params.featured);
    if (params?.category) projects = projects.filter((p) => p.category === params.category);
    if (params?.limit) projects = projects.slice(0, params.limit);
    return { projects, meta: { total: projects.length, featured: projects.filter((p) => p.featured).length } };
  }
  try {
    return await requestProjects(params);
  } catch (error) {
    logger.error('Failed to fetch projects from Admin API', error, { params });
    throw new ApiFetchFailedError('Failed to fetch projects from Admin API', error);
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    return await apiFetch<Project>(`/api/v1/public/projects/${encodeURIComponent(slug)}`);
  } catch (error) {
    logger.error('Failed to fetch project by slug from Admin API', error, { slug });
    return null;
  }
}

export async function getBlogs(limit?: number): Promise<BlogsResponse> {
  if (USE_MOCK) {
    const blogs = limit ? MOCK_BLOGS.slice(0, limit) : MOCK_BLOGS;
    return { blogs, meta: { total: blogs.length } };
  }
  const query = limit ? `?limit=${limit}` : '';
  try {
    return await apiFetch<BlogsResponse>(`/api/v1/public/blogs${query}`);
  } catch (error) {
    logger.error('Failed to fetch blogs from Admin API', error, { limit });
    throw new ApiFetchFailedError('Failed to fetch blogs from Admin API', error);
  }
}

/**
 * Fetches the About/profile data. On failure this throws `ApiFetchFailedError`
 * rather than silently returning `FALLBACK_ABOUT` - callers that render a
 * full page around this data (e.g. index.astro) should catch and return a
 * 503. `FALLBACK_ABOUT` is exported for callers (e.g. BaseLayout, which
 * cannot fail the whole response for every page) that need a best-effort
 * default instead.
 */
export async function getAbout(): Promise<AboutData> {
  if (USE_MOCK) return MOCK_ABOUT;
  try {
    return await apiFetch<AboutData>('/api/v1/public/about');
  } catch (error) {
    logger.error('Failed to fetch about data from Admin API', error);
    throw new ApiFetchFailedError('Failed to fetch about data from Admin API', error);
  }
}

/** Best-effort About data for layout-level callers that must never throw. */
export async function getAboutSafe(): Promise<AboutData> {
  try {
    return await getAbout();
  } catch {
    return FALLBACK_ABOUT;
  }
}

export async function getAchievements(limit?: number): Promise<AchievementsResponse> {
  if (USE_MOCK) {
    const achievements = limit ? MOCK_ACHIEVEMENTS.slice(0, limit) : MOCK_ACHIEVEMENTS;
    return { achievements, meta: { total: achievements.length } };
  }
  const query = limit ? `?limit=${limit}` : '';
  try {
    return await apiFetch<AchievementsResponse>(`/api/v1/public/achievements${query}`);
  } catch (error) {
    logger.error('Failed to fetch achievements from Admin API', error, { limit });
    throw new ApiFetchFailedError('Failed to fetch achievements from Admin API', error);
  }
}

export async function getGuestbookEntries(): Promise<GuestbookResponse> {
  if (USE_MOCK) return { entries: MOCK_GUESTBOOK };
  try {
    return await apiFetch<GuestbookResponse>('/api/v1/public/guestbook');
  } catch (error) {
    logger.error('Failed to fetch guestbook entries from Admin API', error);
    throw new ApiFetchFailedError('Failed to fetch guestbook entries from Admin API', error);
  }
}

export async function submitContactForm(input: ContactSubmissionInput) {
  return localApiFetch<{ id: string; createdAt: string }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getBookingAvailability(days = 14) {
  const searchParams = new URLSearchParams({ days: String(days) });
  return localApiFetch<BookingAvailability>(`/api/bookings/available?${searchParams.toString()}`);
}

export async function submitBooking(input: BookingSubmissionInput) {
  return localApiFetch<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    notes: string | null;
    status: string;
    date: string;
    time: string;
    duration: number;
    createdAt: string;
  }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
