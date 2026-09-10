/**
 * Centralized GitHub data cache with request deduplication and
 * stale-while-revalidate semantics.
 *
 * All homepage components consume GitHub data through hooks exported
 * from this module. This eliminates duplicate API calls, extends cache
 * lifetime, and provides a tiered fallback chain:
 *   in-memory -> localStorage -> bundled static JSON -> error state
 *
 * The hitscounter.dev fetch is intentionally excluded; it is not a
 * GitHub API call and is not subject to the same rate limits.
 */

import { useState, useEffect } from 'react';

import staticReleases from '../data/releases.json';
import staticCommits from '../data/commits.json';
import staticRepoStats from '../data/repo-stats.json';
import staticContributors from '../data/contributors.json';

export interface Release {
  id: number;
  tagName: string;
  codename: string;
  version: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  downloads?: number;
}

export interface Commit {
  sha: string;
  author: string;
  coAuthors: string[];
  date: string;
  message: string;
}

export interface RepoStats {
  stars: number;
  forks: number;
}

export interface Contributor {
  login: string;
  name?: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface ReleasesPayload {
  releases: Release[];
  totalCount: number;
}

type DataStatus = 'LIVE' | 'OFFLINE';
type ErrorState = 'RATE_LIMITED' | 'FAILED' | null;

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/** localStorage key prefixes, versioned to allow safe cache invalidation. */
const LS_KEYS = {
  releases: 'na_gh_releases_v3',
  releasesTime: 'na_gh_releases_time_v3',
  commits: 'na_gh_commits_v3',
  commitsTime: 'na_gh_commits_time_v3',
  repoStats: 'na_gh_stats_v3',
  repoStatsTime: 'na_gh_stats_time_v3',
  contributors: 'na_gh_contributors_v6',
  contributorsTime: 'na_gh_contributors_time_v6',
} as const;

const inflight = new Map<string, Promise<any>>();

/** In-memory data cache surviving across re-renders within a single page session. */
const memoryCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Reads and parses data from localStorage.
 * 
 * @param key The key under which the data is stored in localStorage.
 * @param timeKey The key under which the timestamp is stored.
 * @returns The parsed data and freshness status, or null on cache miss or error.
 */
function readLocalStorage<T>(key: string, timeKey: string): { data: T; fresh: boolean } | null {
  try {
    const raw = localStorage.getItem(key);
    const time = localStorage.getItem(timeKey);
    if (!raw || !time) return null;
    // SAFETY: Generic JSON parse casting
    const data = JSON.parse(raw) as T;
    const fresh = Date.now() - parseInt(time, 10) < CACHE_TTL;
    return { data, fresh };
  } catch {
    return null;
  }
}

/**
 * Serializes and writes data to localStorage.
 * 
 * @param key The destination storage key.
 * @param timeKey The destination timestamp key.
 * @param data The payload to serialize and write.
 */
function writeLocalStorage(key: string, timeKey: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(timeKey, Date.now().toString());
  } catch {
    // localStorage full or unavailable; degrade silently
  }
}

/**
 * Deduplicating fetch wrapper. If a request for the same cacheKey is
 * already in flight, returns the existing Promise.
 * 
 * @param cacheKey Unique identifier key for request de-duplication.
 * @param fetcher Async callback that performs the underlying data fetch.
 * @returns Promise resolving to the fetched data type T.
 */
async function deduplicatedFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const existing = inflight.get(cacheKey);
  if (existing) {
    // SAFETY: Map inflight promise casting
    return existing as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    inflight.delete(cacheKey);
  });

  inflight.set(cacheKey, promise);
  return promise;
}

// --- Fetcher functions ---

async function fetchReleasesFromAPI(): Promise<ReleasesPayload> {
  const response = await fetch(
    'https://api.github.com/repos/spike0en/nothing_archive/releases?per_page=100',
  );

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    throw new Error('FAILED');
  }

  const rawReleases = await response.json();
  let totalCount = rawReleases.length;

  // Resolve total count from pagination Link header
  const linkHeader = response.headers.get('Link');
  if (linkHeader) {
    const lastPageMatch = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
    if (lastPageMatch) {
      const lastPage = parseInt(lastPageMatch[1], 10);
      if (lastPage > 1) {
        try {
          const lastPageResponse = await fetch(
            `https://api.github.com/repos/spike0en/nothing_archive/releases?per_page=100&page=${lastPage}`,
          );
          if (lastPageResponse.ok) {
            const lastPageReleases = await lastPageResponse.json();
            totalCount = (lastPage - 1) * 100 + lastPageReleases.length;
          }
        } catch {
          // Use first-page count as fallback
        }
      }
    }
  }

  const releases: Release[] = rawReleases.map((item: any) => {
    const tagName = item.tag_name || '';
    const parts = tagName.split('_');
    let codename = 'Archive';
    let version = tagName;
    if (parts.length > 1) {
      codename = parts[0];
      version = parts.slice(1).join('_');
    }
    const downloads = item.assets
      ? item.assets.reduce((sum: number, asset: any) => sum + (asset.download_count || 0), 0)
      : 0;

    return {
      id: item.id,
      tagName,
      codename,
      version,
      name: item.name || tagName,
      publishedAt: item.published_at || new Date().toISOString(),
      htmlUrl: item.html_url || '',
      downloads,
    };
  });

  return { releases, totalCount };
}

/**
 * Extracts co-author names from a full commit message body.
 * Parses `Co-authored-by: Name <email>` trailers that GitHub auto-adds on squash merges.
 */
function parseCoAuthors(fullMessage: string, primaryAuthor: string): string[] {
  if (!fullMessage) return [];
  const coAuthorRegex = /Co-authored-by:\s*(.+?)\s*<[^>]*>/gi;
  const names: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = coAuthorRegex.exec(fullMessage)) !== null) {
    const name = match[1].trim();
    if (name && name !== primaryAuthor) names.push(name);
  }
  return names;
}

async function fetchCommitsFromAPI(): Promise<Commit[]> {
  const response = await fetch(
    'https://api.github.com/repos/spike0en/nothing_archive/commits?per_page=100',
  );

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    throw new Error('FAILED');
  }

  const rawCommits = await response.json();
  return rawCommits.map((item: any) => {
    const fullMessage = item.commit.message || '';
    const author = item.commit.author?.name || item.author?.login || 'Contributor';
    return {
      sha: item.sha.substring(0, 7),
      author,
      coAuthors: parseCoAuthors(fullMessage, author),
      // Committer date preserves chronological ordering when author dates are altered or rebased.
      date: item.commit.committer?.date || item.commit.author?.date || new Date().toISOString(),
      message: fullMessage.split('\n')[0] || 'Code updates',
    };
  });
}

async function fetchRepoStatsFromAPI(): Promise<RepoStats> {
  const response = await fetch(
    'https://api.github.com/repos/spike0en/nothing_archive',
  );

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    throw new Error('FAILED');
  }

  const data = await response.json();
  return {
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
  };
}

async function fetchContributorsFromAPI(): Promise<Contributor[]> {
  const response = await fetch(
    'https://api.github.com/repos/spike0en/nothing_archive/contributors?per_page=100',
  );

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    throw new Error('FAILED');
  }

  const raw = await response.json();
  const apiContributors: Contributor[] = raw.map((item: any) => {
    // SAFETY: Static contributors list array casting
    const staticMatch = (staticContributors as any[] || []).find((sc) => sc.login === item.login);
    return {
      login: item.login,
      name: staticMatch?.name || item.name || item.login,
      avatar_url: item.avatar_url,
      html_url: staticMatch?.html_url || item.html_url,
      contributions: item.contributions,
    };
  });

  // Preserve any static contributors (such as core team members) missing from GitHub API response
  const apiLogins = new Set(apiContributors.map((c) => c.login));
  // SAFETY: Static contributors list array casting
  const missingStatic = (staticContributors as Contributor[] || []).filter(
    (sc) => !apiLogins.has(sc.login),
  );

  return [...apiContributors, ...missingStatic];
}

// --- Generic stale-while-revalidate hook factory ---

export interface GitHubDataHookResult<T> {
  data: T;
  status: DataStatus;
  error: ErrorState;
  loading: boolean;
}

export interface GitHubReleasesHookResult {
  releases: Release[];
  totalCount: number;
  status: DataStatus;
  error: ErrorState;
  loading: boolean;
}

export interface GitHubCommitsHookResult {
  commits: Commit[];
  status: DataStatus;
  error: ErrorState;
  loading: boolean;
}

export interface GitHubRepoStatsHookResult {
  stats: RepoStats;
  status: DataStatus;
  error: ErrorState;
  loading: boolean;
}

export interface GitHubContributorsHookResult {
  contributors: Contributor[];
  status: DataStatus;
  error: ErrorState;
  loading: boolean;
}

/**
 * Creates a React hook that implements the full tiered fallback chain:
 *   1. Memory cache (instant, within same page session)
 *   2. localStorage (fast, survives navigations)
 *   3. Bundled static JSON (instant, frozen at deploy time)
 *   4. Live API fetch (freshest, rate-limited)
 *
 * On mount: serves best available cached data immediately, then
 * triggers a background refresh if the cache is stale.
 */
function useGitHubData<T>(config: {
  cacheKey: string;
  lsKey: string;
  lsTimeKey: string;
  staticFallback: T;
  fetcher: () => Promise<T>;
  /** Validates that the data is non-empty / usable */
  isValid: (data: T) => boolean;
}): GitHubDataHookResult<T> {
  const [data, setData] = useState<T>(() => {
    // Synchronous init: check memory cache first
    const mem = memoryCache.get(config.cacheKey);
    if (mem && config.isValid(mem.data)) return mem.data;
    return config.staticFallback;
  });
  const [status, setStatus] = useState<DataStatus>('OFFLINE');
  const [error, setError] = useState<ErrorState>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. Check memory cache
      const mem = memoryCache.get(config.cacheKey);
      if (mem && config.isValid(mem.data)) {
        if (!cancelled) {
          setData(mem.data);
          setStatus('LIVE');
          setError(null);
        }
        const isFresh = Date.now() - mem.timestamp < CACHE_TTL;
        if (isFresh) {
          if (!cancelled) setLoading(false);
          return; // Still fresh, no need to refetch
        }
        // Stale — continue to background refresh but don't show loading
        if (!cancelled) setLoading(false);
      }

      // 2. Check localStorage
      if (globalThis.window !== undefined) {
        const ls = readLocalStorage<T>(config.lsKey, config.lsTimeKey);
        if (ls && config.isValid(ls.data)) {
          if (!cancelled) {
            setData(ls.data);
            setStatus('LIVE');
            setError(null);
            setLoading(false);
          }
          // Populate memory cache
          memoryCache.set(config.cacheKey, {
            data: ls.data,
            timestamp: parseInt(localStorage.getItem(config.lsTimeKey) || '0', 10),
          });
          if (ls.fresh) return; // Still fresh
          // Stale — continue to background refresh
        }
      }

      // 3. Static fallback is already set as initial state — ensure loading clears
      if (!cancelled && loading) {
        // If we have valid static data, show it and clear loading
        if (config.isValid(config.staticFallback)) {
          setLoading(false);
        }
      }

      // 4. Live API fetch (background refresh)
      try {
        const freshData = await deduplicatedFetch(config.cacheKey, config.fetcher);
        if (!cancelled && config.isValid(freshData)) {
          setData(freshData);
          setStatus('LIVE');
          setError(null);
          setLoading(false);
          // Update caches
          memoryCache.set(config.cacheKey, { data: freshData, timestamp: Date.now() });
          if (globalThis.window !== undefined) {
            writeLocalStorage(config.lsKey, config.lsTimeKey, freshData);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setLoading(false);
          // Only show error if we have no cached data at all
          const hasData = config.isValid(data);
          if (!hasData) {
            setError(err.message === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'FAILED');
            setStatus('OFFLINE');
          }
          // If we have stale data, keep showing it — no error state
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, status, error, loading };
}

// --- Public hooks ---

/** Releases feed data with stale-while-revalidate caching. */
export function useGitHubReleases(): GitHubReleasesHookResult {
  // SAFETY: Static releases fallback properties casting
  const fallback: ReleasesPayload = {
    releases: (staticReleases as any).releases || [],
    totalCount: (staticReleases as any).totalCount || 0,
  };

  const { data, status, error, loading } = useGitHubData<ReleasesPayload>({
    cacheKey: 'releases',
    lsKey: LS_KEYS.releases,
    lsTimeKey: LS_KEYS.releasesTime,
    staticFallback: fallback,
    fetcher: fetchReleasesFromAPI,
    isValid: (d) => d.releases.length > 0,
  });

  return { releases: data.releases, totalCount: data.totalCount, status, error, loading };
}

/** Commit history data with stale-while-revalidate caching. */
export function useGitHubCommits(): GitHubCommitsHookResult {
  // SAFETY: Static commits array fallback casting
  const fallback = (staticCommits as any) || [];

  const { data, status, error, loading } = useGitHubData<Commit[]>({
    cacheKey: 'commits',
    lsKey: LS_KEYS.commits,
    lsTimeKey: LS_KEYS.commitsTime,
    staticFallback: Array.isArray(fallback) ? fallback : [],
    fetcher: fetchCommitsFromAPI,
    isValid: (d) => d.length > 0,
  });

  return { commits: data, status, error, loading };
}

/** Repository stars and fork count with stale-while-revalidate caching. */
export function useGitHubRepoStats(): GitHubRepoStatsHookResult {
  // SAFETY: Static repo stats fallback properties casting
  const fallback: RepoStats = {
    stars: (staticRepoStats as any).stars || 0,
    forks: (staticRepoStats as any).forks || 0,
  };

  const { data, status, error, loading } = useGitHubData<RepoStats>({
    cacheKey: 'repoStats',
    lsKey: LS_KEYS.repoStats,
    lsTimeKey: LS_KEYS.repoStatsTime,
    staticFallback: fallback,
    fetcher: fetchRepoStatsFromAPI,
    isValid: (d) => d.stars > 0,
  });

  return { stats: data, status, error, loading };
}

/** Contributor list with stale-while-revalidate caching. */
export function useGitHubContributors(): GitHubContributorsHookResult {
  // SAFETY: Static contributors array fallback casting
  const fallback = Array.isArray(staticContributors) ? (staticContributors as Contributor[]) : [];

  const { data, status, error, loading } = useGitHubData<Contributor[]>({
    cacheKey: 'contributors',
    lsKey: LS_KEYS.contributors,
    lsTimeKey: LS_KEYS.contributorsTime,
    staticFallback: fallback,
    fetcher: fetchContributorsFromAPI,
    isValid: (d) => d.length > 0,
  });

  return { contributors: data, status, error, loading };
}
