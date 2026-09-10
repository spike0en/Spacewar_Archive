/**
 * @file ReleaseFeed.tsx
 * @description Component that displays the live OTA and firmware release updates feed on the homepage.
 *
 * Layer: Home page feed components.
 * Boundary: Consumes GitHub releases cache hook and Docusaurus global changelogs plugin data.
 */

import React from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './ReleaseFeed.module.css';
import { getTimeLag } from '../utils/time';
import { useGitHubReleases } from '../utils/github-cache';
import type { Release } from '../utils/github-cache';

interface ChangelogsPluginData {
  changelogLinks: Record<string, string>;
}

/**
 * Filters and lists latest firmware releases per device model.
 */
export default function ReleaseFeed(): React.JSX.Element {
  const { releases, totalCount: totalReleasesCount, status: statusSource, error: errorState, loading } = useGitHubReleases();
  // SAFETY: Validated by Docusaurus plugin contract
  const { changelogLinks } = usePluginData('changelogs-plugin') as ChangelogsPluginData;
  // Deduplicate builds so each device model displays only its single latest release.
  const latestReleasesPerModel = React.useMemo(() => {
    const seen = new Set<string>();
    const result: Release[] = [];
    
    for (const release of releases) {
      const code = release.codename.toLowerCase();
      if (!seen.has(code)) {
        seen.add(code);
        result.push(release);
      }
    }
    return result;
  }, [releases]);



  const latestRelease = releases[0] || {
    tagName: '------',
    codename: 'N/A',
    version: 'N/A',
    publishedAt: '',
    name: 'Waiting for connection...',
    htmlUrl: '',
  };

  const totalDownloads = React.useMemo(() => {
    return releases.reduce((sum: number, r: Release) => sum + (r.downloads || 0), 0);
  }, [releases]);

  const stats = [
    {
      label: 'LATEST RELEASE',
      value: loading ? '—' : latestRelease.publishedAt ? getTimeLag(latestRelease.publishedAt) + ' ago' : '—',
    },
    {
      label: 'TOTAL RELEASES',
      value: loading ? '—' : `${totalReleasesCount}`,
    },
    {
      label: 'TOTAL DOWNLOADS',
      value: loading ? '—' : totalDownloads.toLocaleString(),
    },
  ];

  return (
    <div className={styles.container}>

      {loading && <div className={styles.loadingBar} />}
      <div className={styles.telemetryHeader}>
        <div className={styles.systemLabel}>
          <span className={styles.feedTextPrefix}>RELEASES</span>
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
          <span>RECENT RELEASES</span>
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
          ) : releases.length === 0 ? (
            <div className={styles.consoleLine}>
              <span className={styles.statusDot} />
              <span className={styles.messageText}>NO RELEASES FOUND</span>
            </div>
          ) : (
            latestReleasesPerModel.map((release, idx) => {
              const changelogKey = `${release.codename}-${release.version}`.toLowerCase();
              const changelogUrl = changelogLinks[changelogKey];
              const hasChangelog = Boolean(changelogUrl);
              const targetUrl = hasChangelog ? changelogUrl : release.htmlUrl;

              return (
                <div key={release.id} className={styles.consoleLine}>
                  <Link
                    to={targetUrl}
                    target={hasChangelog ? undefined : '_blank'}
                    rel={hasChangelog ? undefined : 'noopener noreferrer'}
                    className={styles.releaseLink}
                  >
                    <span className={`${styles.timeLag} ${idx === 0 ? styles.timeLagActive : ''}`}>{getTimeLag(release.publishedAt)}</span>
                    <span className={`${styles.messageText} ${idx === 0 ? styles.messageTextLatest : ''}`}>
                      <span className={idx === 0 ? styles.buildTextLatest : styles.buildText}>
                        {release.name}
                      </span>
                    </span>
                  </Link>
                  <a
                    href={release.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.githubLink} ${idx === 0 ? styles.githubLinkHighlighted : ''}`}
                    title="Open GitHub Release"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.downloadIcon}
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
