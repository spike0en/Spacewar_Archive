/**
 * @file CommitMatrix.tsx
 * @description Component that displays commit statistics, stargazers, page visitor hits, 
 * and a list of recent commits to the repository.
 * 
 * Layer: Home page metadata components.
 * Boundary: Reads GitHub stats/commits hooks and local visitor API, renders local HTML structure.
 */

import React, { useState, useEffect, useMemo } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import clsx from 'clsx';
import styles from './CommitMatrix.module.css';
import { getTimeLag } from '../utils/time';
import { useGitHubCommits, useGitHubRepoStats } from '../utils/github-cache';
import type { Commit } from '../utils/github-cache';


interface HitsState {
  hits: number;
}

const HITS_CACHE_KEY = 'nothing_archive_hits_v1';
const HITS_CACHE_TIME_KEY = 'nothing_archive_hits_time_v1';
const HITS_CACHE_TIMEOUT = 15 * 60 * 1000;

/**
 * Fetches visitor counts, filters recent commits, and formats authors for display.
 */
export default function CommitMatrix(): React.JSX.Element {
  const { commits, status: statusSource, error: errorState, loading } = useGitHubCommits();
  const { stats: repoStats, loading: statsGhLoading } = useGitHubRepoStats();

  // hitscounter.dev is an external visitor tracker, not a GitHub API.
  const [hitsData, setHitsData] = useState<HitsState>({ hits: 0 });
  const [hitsLoading, setHitsLoading] = useState(true);

  const filteredCommits = React.useMemo(() => {
    const TARGET_COMMITS = 7;
    const sorted = [...commits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = sorted.filter(commit => new Date(commit.date).getTime() >= sevenDaysAgo);

    if (recent.length >= TARGET_COMMITS) {
      return recent;
    }
    return sorted.slice(0, TARGET_COMMITS);
  }, [commits]);

  useEffect(() => {
    async function loadHits() {
      try {
        const cachedData = localStorage.getItem(HITS_CACHE_KEY);
        const cachedTime = localStorage.getItem(HITS_CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedData && cachedTime && now - parseInt(cachedTime, 10) < HITS_CACHE_TIMEOUT) {
          setHitsData(JSON.parse(cachedData));
          setHitsLoading(false);
          return;
        }

        const hitsRes = await fetch(
          'https://hitscounter.dev/api/hit?output=json&url=https%3A%2F%2Fgithub.com%2Fspike0en%2Fnothing_archive'
        );

        let hits = 0;
        if (hitsRes.ok) {
          const data = await hitsRes.json();
          hits = data.total_hits || 0;
        } else {
          const old = cachedData ? JSON.parse(cachedData) : null;
          hits = old ? old.hits : 0;
        }

        const newHits = { hits };
        localStorage.setItem(HITS_CACHE_KEY, JSON.stringify(newHits));
        localStorage.setItem(HITS_CACHE_TIME_KEY, now.toString());
        setHitsData(newHits);
        setHitsLoading(false);
      } catch (err) {
        console.warn('loadHits failed', err);
        setHitsLoading(false);
      }
    }

    loadHits();
  }, []);

  const latestCommit = commits[0] || { sha: '------', author: 'N/A', coAuthors: [], date: '', message: 'Waiting for connection...' };

  const stats = [
    {
      label: 'LAST COMMIT',
      value: loading ? '—' : latestCommit.date ? getTimeLag(latestCommit.date) + ' ago' : '—',
    },
    {
      label: 'STARS',
      value: statsGhLoading ? '—' : repoStats.stars.toLocaleString(),
    },
    {
      label: 'VIEWS',
      value: hitsLoading ? '—' : hitsData.hits.toLocaleString(),
    },
  ];

  /**
   * Measures the widest author string with Canvas to align commit titles into a column.
   */
  const dynamicAuthorWidth = useMemo(() => {
    if (!ExecutionEnvironment.canUseDOM) return 110;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 110;
      ctx.font = '500 0.72rem Geist, "Inter var", Inter, system-ui, sans-serif';
      let maxW = 40;
      filteredCommits.forEach((commit) => {
        if (commit.coAuthors.length === 0) {
          maxW = Math.max(maxW, ctx.measureText(commit.author).width);
        } else if (commit.coAuthors.length === 1) {
          const line = `${commit.author} & ${commit.coAuthors[0]}`;
          maxW = Math.max(maxW, ctx.measureText(line).width);
        } else {
          const all = [commit.author, ...commit.coAuthors];
          const initial = all.slice(0, -1).join(', ') + ' &';
          const last = all[all.length - 1];
          maxW = Math.max(maxW, ctx.measureText(initial).width, ctx.measureText(last).width);
        }
      });
      return Math.ceil(maxW) + 2;
    } catch {
      return 110;
    }
  }, [filteredCommits]);

  /**
   * Formats primary and co-authors inline for repository contributors.
   */
  const formatAuthors = (commit: Commit, isLatest: boolean): React.JSX.Element => {
    const authorClass = clsx(styles.authorTag, isLatest && styles.authorLatest);
    if (commit.coAuthors.length === 0) {
      return (
        <span className={styles.authorsWrapper} style={{ width: `${dynamicAuthorWidth}px` }}>
          <span className={styles.authorLine}>
            <span className={authorClass} title={commit.author}>{commit.author}</span>
          </span>
        </span>
      );
    }

    const allAuthors = [commit.author, ...commit.coAuthors];
    const tooltip = allAuthors.join(', ');

    if (allAuthors.length === 2) {
      return (
        <span className={styles.authorsWrapper} style={{ width: `${dynamicAuthorWidth}px` }} title={tooltip}>
          <span className={styles.authorLine}>
            <span className={authorClass}>{allAuthors[0]}</span>
            <span className={styles.coAuthorSeparator}> &amp; </span>
            <span className={authorClass}>{allAuthors[1]}</span>
          </span>
        </span>
      );
    }

    const initialAuthors = allAuthors.slice(0, -1);
    const lastAuthor = allAuthors[allAuthors.length - 1];
    return (
      <span className={styles.authorsWrapper} style={{ width: `${dynamicAuthorWidth}px` }} title={tooltip}>
        <span className={styles.authorLine}>
          {initialAuthors.map((author, i) => (
            <React.Fragment key={author}>
              <span className={authorClass}>{author}</span>
              <span className={styles.coAuthorSeparator}>
                {i === initialAuthors.length - 1 ? ' & ' : ', '}
              </span>
            </React.Fragment>
          ))}
        </span>
        <span className={styles.authorLine}>
          <span className={authorClass}>{lastAuthor}</span>
        </span>
      </span>
    );
  };

  const isProgressLoading = loading || statsGhLoading || hitsLoading;

  return (
    <div className={styles.container}>

      {isProgressLoading && <div className={styles.loadingBar} />}
      <div className={styles.telemetryHeader}>
        <div className={styles.systemLabel}>
          <span className={styles.feedTextPrefix}>REPO</span>
          {(errorState || statusSource !== 'LIVE') && (
            <span className={styles.feedStatusOffline}>
              {errorState === 'RATE_LIMITED' ? 'RATE LIMITED' : errorState ? 'ERROR' : 'OFFLINE'}
            </span>
          )}
        </div>
      </div>

      <div className={styles.statsStrip}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statItem}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.consolePanel}>
        <div className={styles.consoleHeader}>
          <span>RECENT CHANGES</span>
        </div>
        <div className={styles.consoleBody}>
          {loading ? (
            <div className={styles.consoleLine}>
              <span className={styles.statusDot} />
              <span className={styles.messageText}>CONNECTING TELEMETRY FEED...</span>
            </div>
          ) : errorState === 'RATE_LIMITED' ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorHeader}>&gt; RATE LIMIT REACHED</div>
              <div className={styles.errorMessage}>
                GITHUB API LIMIT EXCEEDED. PLEASE REFRESH AGAIN LATER.
              </div>
            </div>
          ) : errorState === 'FAILED' ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorHeader}>&gt; CONNECTION ERROR</div>
              <div className={styles.errorMessage}>
                COULD NOT SYNC WITH REPOSITORY. CHECK NETWORK CONNECTION.
              </div>
            </div>
          ) : commits.length === 0 ? (
            <div className={styles.consoleLine}>
              <span className={styles.statusDot} />
              <span className={styles.messageText}>NO COMMITS FOUND</span>
            </div>
          ) : filteredCommits.length === 0 ? (
            <div className={styles.consoleLine}>
              <span className={styles.statusDot} />
              <span className={styles.messageText}>NO RECENT COMMITS</span>
            </div>
          ) : (
            filteredCommits.map((commit, idx) => {
              const isLatest = idx === 0;
              return (
                <a
                  key={commit.sha}
                  href={`https://github.com/spike0en/nothing_archive/commit/${commit.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.consoleLine}
                >
                  <span className={`${styles.timeLag} ${isLatest ? styles.timeLagActive : ''}`}>{getTimeLag(commit.date)}</span>
                  {formatAuthors(commit, isLatest)}
                  <span className={`${styles.messageText} ${isLatest ? styles.messageTextLatest : ''}`}>{commit.message}</span>
                  <span className={`${styles.shaTag} ${isLatest ? styles.shaLatest : ''}`}>{commit.sha}</span>
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
