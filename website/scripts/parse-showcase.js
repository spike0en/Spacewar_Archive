/**
 * @file parse-showcase.js
 * @description Extracts community showcase apps and projects from markdown documentation,
 * scrapes Play Store preview icons, resolves GitHub avatars, and builds showcase data.
 * 
 * Layer: Prebuild data pipeline.
 * Boundary: Reads local markdown documentation files, fetches icon previews, and writes src/data/showcase-items.json.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const OUT_FILE = path.join(__dirname, '..', 'src', 'data', 'showcase-items.json');
const ICONS_CACHE_FILE = path.join(__dirname, '..', 'src', 'data', 'showcase-icons-cache.json');
const PRICING_CACHE_FILE = path.join(__dirname, '..', 'src', 'data', 'showcase-pricing-cache.json');
const CONFIG_FILE = path.join(__dirname, '..', 'src', 'data', 'showcase-config.json');

// Curated editorial configuration for spotlight slugs, platform overrides, and category overrides
const showcaseConfig = fs.existsSync(CONFIG_FILE) ? JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) : {};
const FEATURED_SLUGS = new Set(showcaseConfig.featuredSlugs || []);
const PROJECT_PLATFORM_OVERRIDES = showcaseConfig.platformOverrides || {};
const CATEGORY_OVERRIDES = showcaseConfig.categoryOverrides || {};
const ICON_OVERRIDES = showcaseConfig.iconOverrides || {};

/**
 * Loads cached icon URLs from disk to prevent redundant HTTP requests across builds.
 *
 * @returns {Record<string, string>} Mapping of package/slug identifiers to cached icon URLs.
 */

/**
 * Loads cached app pricing metadata from disk.
 *
 * @returns {Record<string, { isPaid: boolean; price?: string; store?: string }>} Pricing cache map.
 */
function loadPricingCache() {
  if (fs.existsSync(PRICING_CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PRICING_CACHE_FILE, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Persists the updated pricing cache to disk.
 *
 * @param {Record<string, object>} cache - Mapping of package/app IDs to pricing info.
 */
function savePricingCache(cache) {
  fs.mkdirSync(path.dirname(PRICING_CACHE_FILE), { recursive: true });
  fs.writeFileSync(PRICING_CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Fetches pricing metadata from Google Play with regional fallbacks.
 *
 * @param {string} packageId - Android package identifier.
 * @returns {Promise<{ isPaid: boolean; price?: string }>} Resolved pricing info.
 */
function fetchPlayStorePrice(packageId) {
  return new Promise((resolve) => {
    const regions = ['', 'GB', 'IN', 'DE', 'US'];
    let idx = 0;

    function tryNextRegion() {
      if (idx >= regions.length) {
        return resolve({ isPaid: false, price: 'Free' });
      }
      const gl = regions[idx++];
      const url = `https://play.google.com/store/apps/details?id=${packageId}&hl=en` + (gl ? `&gl=${gl}` : '');
      const req = https.get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-GB,en-US,en;q=0.9',
          },
        },
        (res) => {
          if (res.statusCode === 404) {
            return tryNextRegion();
          }
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            const priceMatch = data.match(/itemprop="price"\s+content="([^"]+)"/);
            const schemaPrice = data.match(/"@type":"Offer","price":"([^"]+)"/);
            const jsonPrice = data.match(/"price":"([\d.]+)"/);
            let val = priceMatch ? priceMatch[1] : (schemaPrice ? schemaPrice[1] : (jsonPrice ? jsonPrice[1] : null));

            if (!val || val === '0' || val.toLowerCase() === 'free') {
              const buyMatch = data.match(/aria-label="[^"]*Buy[^"]*([^\s"]+[\d.,]+|[\d.,]+\s*[^\s"]+)/);
              if (buyMatch) {
                val = buyMatch[1];
              }
            }

            if (val && val !== '0' && val.toLowerCase() !== 'free') {
              resolve({ isPaid: true, price: val });
            } else {
              resolve({ isPaid: false, price: 'Free' });
            }
          });
        }
      );
      req.on('error', () => tryNextRegion());
      req.setTimeout(4000, () => {
        req.destroy();
        tryNextRegion();
      });
    }

    tryNextRegion();
  });
}

function loadIconsCache() {
  if (fs.existsSync(ICONS_CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ICONS_CACHE_FILE, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Persists the updated icon URL cache to disk.
 *
 * @param {Record<string, string>} cache - Mapping of package/slug identifiers to icon URLs.
 */
function saveIconsCache(cache) {
  fs.mkdirSync(path.dirname(ICONS_CACHE_FILE), { recursive: true });
  fs.writeFileSync(ICONS_CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Scrapes the Play Store application icon URL directly from Google Play listing markup.
 *
 * @param {string} packageId - Android application package identifier.
 * @returns {Promise<string | null>} Resolved icon URL string or null on failure.
 */
function fetchPlayStoreIcon(packageId) {
  return new Promise((resolve) => {
    const url = `https://play.google.com/store/apps/details?id=${packageId}&hl=en`;
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const match = data.match(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_-]+/);
          resolve(match ? match[0] : null);
        });
      }
    );
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Scrapes the primary extension icon image URL from a Chrome Web Store listing.
 *
 * @param {string} url - Chrome Web Store listing URL.
 * @returns {Promise<string | null>} Resolved icon URL string or null on failure.
 */
function fetchChromeWebStoreIcon(url) {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const metaMatch = data.match(/<meta[^>]+(?:property|name|itemprop)=["'](?:og:image|image|twitter:image)["'][^>]+content=["']([^"']+)["']/i);
          if (metaMatch && metaMatch[1]) {
            return resolve(metaMatch[1]);
          }
          const imgMatch = data.match(/https:\/\/(?:lh3|lh4|lh5|lh6)\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+/);
          if (imgMatch) {
            return resolve(imgMatch[0]);
          }
          resolve(null);
        });
      }
    );
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Resolves the highest quality icon or logo available for a generic web page URL.
 * Scrapes Apple Touch Icon, OpenGraph preview image, and standard favicons with fallback.
 *
 * @param {string} url - Target website URL.
 * @returns {Promise<string | null>} Resolved icon URL string or null on failure.
 */
async function fetchWebIcon(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const appleMatch = html.match(/<link[^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["'][^>]+href=["']([^"']+)["']/i)
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["']/i);
    if (appleMatch && appleMatch[1]) {
      return new URL(appleMatch[1], url).href;
    }

    const ogMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
    if (ogMatch && ogMatch[1]) {
      const ogUrl = ogMatch[1].trim();
      if (!ogUrl.includes('screenshot') && !ogUrl.endsWith('.mp4')) {
        return new URL(ogUrl, url).href;
      }
    }

    const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+href=["']([^"']+)["']/i)
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon)["']/i);
    if (iconMatch && iconMatch[1]) {
      return new URL(iconMatch[1], url).href;
    }

    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  }
}

/**
 * Extracts text and URL components from inline markdown link syntax `[Text](Url)`.
 *
 * @param {string} text - Raw markdown text.
 * @returns {{ text: string; url: string | null }} Extracted label and optional URL.
 */
function parseMarkdownLink(text) {
  const match = text.match(/\[(.*?)\]\((.*?)\)/);
  if (match) {
    return { text: match[1].trim(), url: match[2].trim() };
  }
  return { text: text.trim(), url: null };
}

/**
 * Strips raw markdown link syntax and boilerplate repo annotations from description text.
 *
 * @param {string} desc - Raw markdown description string.
 * @returns {string} Sanitized plain-text description.
 */
function sanitizeDescription(desc) {
  if (!desc) return '';
  let clean = desc.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
  clean = clean.replace(/\(?\s*\[?Repo\]?\s*\)?/gi, '');
  clean = clean.replace(/\s+/g, ' ').replace(/\s*\(\s*\)/g, '').trim();
  return clean;
}

/**
 * Converts a text string into a URL-friendly lowercase kebab-case slug identifier.
 *
 * @param {string} text - Source title or category string.
 * @returns {string} Normalized kebab-case slug.
 */
function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Splits composite developer attribution string into individual trimmed developer names.
 *
 * @param {string} [devString] - Raw developer attribution string.
 * @returns {string[]} List of individual cleaned developer names.
 */
function parseDevelopers(devString) {
  if (!devString) return [];
  return devString
    .split(/\s*&\s*|\s*,\s*|\s+and\s+|\s*\/\s*/i)
    .map((d) => d.trim())
    .filter(Boolean);
}


/**
 * Resolves target operating systems based on text heuristics, package links, and explicit overrides.
 *
 * @param {string} combinedText - Aggregated description, title, and section strings for heuristic matching.
 * @param {string | null} mainUrl - Primary outbound link URL.
 * @param {'apps' | 'projects'} source - Origin catalog category.
 * @param {string} slug - Unique item identifier used for explicit overrides.
 * @param {Record<string, string>} [links] - Extracted link destinations.
 * @returns {string[]} List of resolved platform identifiers (e.g. 'android', 'web', 'windows', 'ios', 'macos').
 */
function resolvePlatformOS(combinedText, mainUrl, source, slug, links = {}) {
  if (PROJECT_PLATFORM_OVERRIDES[slug]) {
    return PROJECT_PLATFORM_OVERRIDES[slug];
  }

  const text = combinedText.toLowerCase();
  const osList = [];

  const isAndroid = mainUrl?.includes('play.google.com') ||
                    (source === 'apps' && !mainUrl?.includes('apps.apple.com')) ||
                    /\b(?:android|apk|play store|phone \(\d\)|cmf phone|magisk|ksu|kernelsu|xposed|lsposed)\b/i.test(text);

  const isWindows = /\b(?:windows|rainmeter|vs\s*code|win11|win10)\b|\.exe\b/i.test(text);
  const isLinux = /\b(?:linux|kde|arch|ubuntu|kde plasma|ruri|gnome|gtk4|sddm)\b/i.test(text);
  const isMacOS = /\b(?:macos|mac os|apple silicon|alfred workflow)\b/i.test(text);
  const isIOS = mainUrl?.includes('apps.apple.com') ||
                Boolean(links.appStore) ||
                /\b(?:iphone|ipad|apple watch|apple shortcuts|siri shortcut)\b/i.test(text);
  const isWeb = mainUrl?.includes('github.io') ||
                mainUrl?.includes('vercel.app') ||
                mainUrl?.includes('pages.dev') ||
                mainUrl?.includes('chromewebstore.google.com') ||
                mainUrl?.includes('nothing.wiki') ||
                mainUrl?.includes('nothingarchive.tech') ||
                /\b(?:web app|online tool|browser extension|chrome extension|new tab|web portal)\b/i.test(text);

  if (isAndroid) osList.push('android');
  if (isWindows) osList.push('windows');
  if (isLinux) osList.push('linux');
  if (isMacOS) osList.push('macos');
  if (isIOS) osList.push('ios');
  if (isWeb) osList.push('web');

  if (osList.length === 0) {
    if (source === 'apps') osList.push('android');
    else osList.push('web');
  }

  return osList;
}

/**
 * Parses markdown table entries from docs/apps.md or docs/projects.md.
 * Extracts structural hierarchy from H2 (broad category), H3 (subcategory), and H4 headings.
 *
 * @param {string} fileName - Markdown file name within the docs directory.
 * @param {'apps' | 'projects'} source - Origin collection name.
 * @returns {Array<object>} Array of parsed showcase item records with taxonomy metadata.
 */
function parseDocFile(fileName, source) {
  const filePath = path.join(DOCS_DIR, fileName);
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const items = [];

  let currentH2 = '';
  let currentH3 = '';
  let currentH4 = '';
  let inTable = false;
  let headers = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('## ')) {
      currentH2 = line.replace(/^##\s+/, '').trim();
      currentH3 = '';
      currentH4 = '';
      inTable = false;
      continue;
    }
    if (line.startsWith('### ')) {
      currentH3 = line.replace(/^###\s+/, '').trim();
      currentH4 = '';
      inTable = false;
      continue;
    }
    if (line.startsWith('#### ')) {
      currentH4 = line.replace(/^####\s+/, '').trim();
      inTable = false;
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      // Header separator row validation
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        inTable = true;
        continue;
      }

      if (!inTable) {
        headers = cells.map(c => c.toLowerCase());
        continue;
      }

      // Process table row entries
      if (cells.length >= 2) {
        let titleCell = cells[0];
        let devCell = cells[1];
        let compatCell = '';
        let descCell = '';
        let customMainUrl = null;

        if (headers[0] === 'developer' && (headers[1] === 'sources' || headers[1] === 'source')) {
          const devParsed = parseMarkdownLink(cells[0]);
          devCell = devParsed.text;
          titleCell = `Nothing OS Ported Apps (${devParsed.text})`;
          descCell = `Unofficial Nothing OS app ports and resources maintained by ${devParsed.text}.`;
          
          const linkMatches = [...cells[1].matchAll(/\[(.*?)\]\((.*?)\)/g)];
          if (linkMatches.length > 0) {
            customMainUrl = linkMatches[0][2];
          }
        } else if (cells.length >= 4) {
          compatCell = cells[2];
          descCell = cells[3];
        } else if (cells.length === 3) {
          descCell = cells[2];
        } else if (cells.length === 2 && (headers.includes('developer') || headers.includes('app'))) {
          titleCell = cells[0];
          devCell = cells[1];
          descCell = `${currentH3 || currentH2} pack for Nothing OS`;
        }

        const projectLink = parseMarkdownLink(titleCell);
        const devLink = parseMarkdownLink(devCell);

        const title = (headers[0] === 'developer' && headers[1] === 'sources')
          ? titleCell
          : projectLink.text.replace(/^\[|\]$/g, '').trim();

        if (!title || title.toLowerCase() === 'project' || title.toLowerCase() === 'app') continue;

        const mainUrl = customMainUrl || projectLink.url;
        const description = sanitizeDescription(descCell) || `${currentH3 || currentH2} for the Nothing ecosystem.`;
        const combinedText = `${title} ${description} ${compatCell} ${currentH4} ${currentH3} ${currentH2} ${fileName}`;

        // Build hierarchical taxonomy identifiers
        const category = currentH2 || 'General';
        const categoryKey = slugify(category);

        const hasSubCategory = Boolean(currentH3);
        const subCategory = currentH3 || category;
        // Scoped key prevents collision between identical subcategories across distinct H2 parents
        const subCategoryKey = hasSubCategory ? `${categoryKey}--${slugify(currentH3)}` : categoryKey;

        const hasSubSubCategory = Boolean(currentH4);
        const subSubCategory = currentH4 || undefined;
        const subSubCategoryKey = hasSubSubCategory ? `${subCategoryKey}--${slugify(currentH4)}` : undefined;

        const categoryHierarchy = [currentH2, currentH3, currentH4].filter(Boolean);

        const slug = slugify(title);

        const links = {};
        let platform = 'other';
        if (mainUrl) {
          if (mainUrl.includes('play.google.com')) {
            links.playStore = mainUrl;
            platform = 'playStore';
          } else if (mainUrl.includes('apps.apple.com')) {
            links.appStore = mainUrl;
            platform = 'appStore';
          } else if (mainUrl.includes('github.com')) {
            links.github = mainUrl;
            platform = 'github';
          } else {
            links.website = mainUrl;
            platform = 'web';
          }
        }

        const appStoreMatch = descCell.match(/\[(?:iOS|App Store|Apple)\]\((https:\/\/apps\.apple\.com\/[^\s)]+)\)/i);
        if (appStoreMatch && appStoreMatch[1]) {
          links.appStore = appStoreMatch[1];
        }

        const repoMatch = descCell.match(/\[Repo\]\((.*?)\)/i);
        if (repoMatch && repoMatch[1]) {
          links.github = repoMatch[1];
        }

        const platformOS = resolvePlatformOS(combinedText, mainUrl, source, slug, links);
        links.docs = `/docs/${path.basename(fileName, '.md')}`;

        const isFeatured = FEATURED_SLUGS.has(slug);

        items.push({
          id: `${source}-${slug}`,
          slug,
          title,
          developer: devLink.text || 'Community Developer',
          developerUrl: devLink.url || undefined,
          description,
          source,
          category,
          categoryKey,
          subCategory,
          subCategoryKey,
          hasDistinctSubCategory: hasSubCategory,
          subSubCategory,
          subSubCategoryKey,
          categoryHierarchy,
          platformOS,
          platform,
          links,
          featured: isFeatured,
        });
      }
    } else {
      inTable = false;
    }
  }

  return items;
}

/**
 * Builds structured two-tier category hierarchy (H2 categories and nested H3 subcategories) with counts.
 *
 * @param {Array<object>} items - Full list of parsed showcase items.
 * @returns {{ all: Array<object>; apps: Array<object>; projects: Array<object> }}
 */
function buildDynamicCategoryHierarchy(items) {
  function getCategoriesForList(list) {
    // Preserve discovery insertion order for broad categories
    const categoryOrder = [];
    const categoryMap = new Map();

    for (const item of list) {
      const catKey = item.categoryKey;
      if (!categoryMap.has(catKey)) {
        categoryOrder.push(catKey);
        categoryMap.set(catKey, {
          id: catKey,
          label: item.category,
          count: 0,
          subCategoryOrder: [],
          subCategoryMap: new Map(),
        });
      }

      const catEntry = categoryMap.get(catKey);
      catEntry.count += 1;

      // Group subcategories only when an explicit H3 was present in document source
      if (item.hasDistinctSubCategory) {
        const subKey = item.subCategoryKey;
        if (!catEntry.subCategoryMap.has(subKey)) {
          catEntry.subCategoryOrder.push(subKey);
          catEntry.subCategoryMap.set(subKey, {
            id: subKey,
            label: item.subCategory,
            count: 0,
            categoryKey: catKey,
          });
        }
        const subEntry = catEntry.subCategoryMap.get(subKey);
        subEntry.count += 1;
      }
    }

    const categories = [];

    for (const catKey of categoryOrder) {
      const catData = categoryMap.get(catKey);
      const subCategories = catData.subCategoryOrder.map((subKey) => catData.subCategoryMap.get(subKey));

      categories.push({
        id: catData.id,
        label: catData.label,
        count: catData.count,
        subCategories,
      });
    }

    return categories;
  }

  const appsList = items.filter(i => i.source === 'apps');
  const projectsList = items.filter(i => i.source === 'projects');

  return {
    all: getCategoriesForList(items),
    apps: getCategoriesForList(appsList),
    projects: getCategoriesForList(projectsList),
  };
}

/**
 * Main execution orchestrator parsing markdown docs, resolving icon previews, and writing JSON payload.
 */
async function main() {
  console.log('[parse-showcase] Dynamically extracting items from docs/apps.md and docs/projects.md...');

  const appItems = parseDocFile('apps.md', 'apps');
  const projectItems = parseDocFile('projects.md', 'projects');

  const iconsCache = loadIconsCache();
  let iconsFetchedCount = 0;
  const pricingCache = loadPricingCache();
  let pricingFetchedCount = 0;

  // Resolve Play Store icon, Chrome Web Store favicon, or GitHub avatar for items, and pricing status
  for (const item of [...appItems, ...projectItems]) {
    const playStoreUrl = item.links.playStore;
    const appStoreUrl = item.links.appStore;
    const githubUrl = item.links.github;
    const webUrl = item.links.website;

    if (ICON_OVERRIDES[item.slug]) {
      item.iconUrl = ICON_OVERRIDES[item.slug];
    } else if (playStoreUrl) {
      const match = playStoreUrl.match(/id=([a-zA-Z0-9._]+)/);
      if (match && match[1]) {
        const pkgId = match[1];
        if (iconsCache[pkgId]) {
          item.iconUrl = iconsCache[pkgId];
        } else {
          const fetchedIcon = await fetchPlayStoreIcon(pkgId);
          if (fetchedIcon) {
            iconsCache[pkgId] = fetchedIcon;
            item.iconUrl = fetchedIcon;
            iconsFetchedCount++;
          }
        }

        if (pricingCache[pkgId]) {
          item.isPaid = pricingCache[pkgId].isPaid || false;
          if (pricingCache[pkgId].price) item.price = pricingCache[pkgId].price;
        } else {
          const priceInfo = await fetchPlayStorePrice(pkgId);
          pricingCache[pkgId] = { isPaid: priceInfo.isPaid, price: priceInfo.price, store: 'Google Play', title: item.title };
          item.isPaid = priceInfo.isPaid;
          if (priceInfo.price) item.price = priceInfo.price;
          pricingFetchedCount++;
        }
      }
    } else if (appStoreUrl) {
      const match = appStoreUrl.match(/id(\d+)/);
      if (match && match[1]) {
        const aid = match[1];
        if (pricingCache[aid]) {
          item.isPaid = pricingCache[aid].isPaid || false;
          if (pricingCache[aid].price) item.price = pricingCache[aid].price;
        }
      }
    } else if (webUrl && (webUrl.includes('chromewebstore.google.com') || webUrl.includes('chrome.google.com'))) {
      const extMatch = webUrl.match(/\/([a-z]{32})(?:\?|$|\/)/i);
      const extKey = extMatch ? `cws_${extMatch[1]}` : item.slug;
      if (iconsCache[extKey]) {
        item.iconUrl = iconsCache[extKey];
      } else {
        const fetchedIcon = await fetchChromeWebStoreIcon(webUrl);
        if (fetchedIcon) {
          iconsCache[extKey] = fetchedIcon;
          item.iconUrl = fetchedIcon;
          iconsFetchedCount++;
        } else {
          item.iconUrl = 'https://www.google.com/s2/favicons?domain=chromewebstore.google.com&sz=128';
        }
      }
    } else if (githubUrl) {
      const match = githubUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const owner = match[1];
        item.iconUrl = `https://github.com/${owner}.png?size=80`;
      }
    } else if (webUrl) {
      const cacheKey = `web_${item.slug}`;
      if (iconsCache[cacheKey]) {
        item.iconUrl = iconsCache[cacheKey];
      } else {
        const fetchedIcon = await fetchWebIcon(webUrl);
        if (fetchedIcon) {
          iconsCache[cacheKey] = fetchedIcon;
          item.iconUrl = fetchedIcon;
          iconsFetchedCount++;
        }
      }
    }
  }

  if (iconsFetchedCount > 0) {
    saveIconsCache(iconsCache);
    console.log(`[parse-showcase] Fetched ${iconsFetchedCount} new Play Store app icons.`);
  }

  if (pricingFetchedCount > 0) {
    savePricingCache(pricingCache);
    console.log(`[parse-showcase] Fetched ${pricingFetchedCount} new Play Store pricing records.`);
  }

  // Compute total projects count per developer across both sources and collect multi-category keys
  const devCounts = new Map();
  const uniqueItemsMap = new Map();
  const uniqueItems = [];

  for (const item of [...appItems, ...projectItems]) {
    const key = `${item.source}-${item.slug}`;
    if (!uniqueItemsMap.has(key)) {
      const explicitOverrides = CATEGORY_OVERRIDES[item.slug] || [];
      item.categoryKeys = Array.from(new Set([item.categoryKey, ...explicitOverrides]));
      item.subCategoryKeys = [item.subCategoryKey];
      uniqueItemsMap.set(key, item);
      uniqueItems.push(item);
      const devs = parseDevelopers(item.developer);
      for (const d of devs) {
        const devKey = d.toLowerCase().trim();
        devCounts.set(devKey, (devCounts.get(devKey) || 0) + 1);
      }
    } else {
      const existing = uniqueItemsMap.get(key);
      if (!existing.categoryKeys.includes(item.categoryKey)) {
        existing.categoryKeys.push(item.categoryKey);
      }
      if (item.subCategoryKey && !existing.subCategoryKeys.includes(item.subCategoryKey)) {
        existing.subCategoryKeys.push(item.subCategoryKey);
      }
    }
  }

  const allItems = [];
  for (const item of uniqueItems) {
    const devs = parseDevelopers(item.developer);
    // Use max count among co-developers or fallback to 1
    let maxCount = 1;
    for (const d of devs) {
      const devKey = d.toLowerCase().trim();
      const count = devCounts.get(devKey) || 1;
      if (count > maxCount) maxCount = count;
    }
    allItems.push({
      ...item,
      developerProjectsCount: maxCount,
    });
  }

  // Generate structured category hierarchy directly from parsed Markdown headings
  const categories = buildDynamicCategoryHierarchy(allItems);

  const payload = {
    items: allItems,
    categories,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));

  console.log(`[parse-showcase] Success: Wrote ${allItems.length} items with hierarchical categories to showcase-items.json.`);
}

main();
