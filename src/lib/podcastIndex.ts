/**
 * Podcast Index API integration via Cloudflare Worker proxy
 *
 * The Worker handles authentication and CORS, and exposes endpoints:
 * GET /search?q=searchterm&medium=music - Search for music content
 * GET /recent?medium=music - Get recent music episodes
 *
 * This app filters for music content only using the 'medium' parameter.
 */

import type { TrackMetadata, ValueTag, MusicSourceProvider } from './musicTypes';

// Cloudflare Worker proxy URL
const PROXY_URL = import.meta.env.VITE_PI_PROXY_URL || 'https://trustwave-pi-proxy.malfactoryst.workers.dev';

// Check if proxy is configured
const isProxyConfigured = Boolean(PROXY_URL);

// Debug logging
console.log('Podcast Index proxy URL:', PROXY_URL);
console.log('Podcast Index available:', isProxyConfigured);

interface PodcastIndexFeed {
  id: number;
  title: string;
  url: string;
  author: string;
  description: string;
  image: string;
  artwork: string;
  newestItemPublishTime: number;
  categories: Record<string, string>;
  value?: {
    model: {
      type: string;
      method: string;
      suggested: string;
    };
    destinations: {
      name: string;
      type: string;
      address: string;
      split: number;
      customKey?: string;
      customValue?: string;
    }[];
  };
  episodeCount?: number;
}

interface PodcastIndexSearchResponse {
  status: string;
  feeds: PodcastIndexFeed[];
  count: number;
  query: string;
  description: string;
}

/**
 * Search for music on Podcast Index via Worker proxy
 */
export async function searchPodcastIndex(query: string): Promise<TrackMetadata[]> {
  if (!isProxyConfigured) {
    console.warn('Podcast Index proxy not configured');
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    // Use /search endpoint with medium=music to filter for music content only
    const fetchUrl = `${PROXY_URL}/search?q=${encodedQuery}&max=60&medium=music`;
    console.log('🔍 Searching Podcast Index for music:', fetchUrl);

    const response = await fetch(fetchUrl);
    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Search failed:', response.status, errorText);
      return [];
    }

    const data: PodcastIndexSearchResponse = await response.json();
    console.log('✅ Received data:', data);

    if (data.status !== 'true' || !data.feeds) {
      console.error('Invalid response format:', data);
      return [];
    }

    console.log(`📻 Found ${data.feeds.length} podcasts/feeds`);

    // Convert feeds to TrackMetadata
    // Note: These are podcast feeds, not individual tracks
    // Users can add the feed itself or we treat the feed as a "track"
    const tracks: TrackMetadata[] = data.feeds.map(feed => {
      let valueTag: ValueTag | undefined;

      if (feed.value) {
        valueTag = {
          type: feed.value.model.type,
          method: feed.value.model.method,
          suggested: feed.value.model.suggested,
          recipients: feed.value.destinations.map(dest => ({
            name: dest.name,
            type: dest.type,
            address: dest.address,
            split: dest.split,
            customKey: dest.customKey,
            customValue: dest.customValue,
          })),
        };
      }

      return {
        id: String(feed.id),
        title: feed.title,
        artist: feed.author || 'Unknown Artist',
        album: feed.title,
        duration: undefined,
        enclosureUrl: feed.url, // RSS feed URL
        artworkUrl: feed.artwork || feed.image,
        feedUrl: feed.url,
        guid: String(feed.id),
        valueTag,
        description: feed.description,
      };
    });

    return tracks;
  } catch (error) {
    console.error('💥 Error searching Podcast Index:', error);
    return [];
  }
}

/**
 * Get recent/featured music from Podcast Index
 */
export async function getRecentMusic(max = 20): Promise<TrackMetadata[]> {
  if (!isProxyConfigured) {
    console.warn('Podcast Index proxy not configured');
    return [];
  }

  try {
    // Use /recent endpoint with medium=music to get recent music episodes
    const fetchUrl = `${PROXY_URL}/recent?max=${max}&medium=music`;
    console.log('🎵 Getting featured music:', fetchUrl);

    const response = await fetch(fetchUrl);
    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Featured music fetch failed:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log('✅ Received recent music data:', data);

    if (data.status !== 'true' || !data.items) {
      console.error('Invalid response format:', data);
      return [];
    }

    console.log(`🎵 Found ${data.items.length} recent music episodes`);

    // Convert episodes to TrackMetadata
    // Group by feed to get unique music feeds
    const feedMap = new Map<number, TrackMetadata>();

    for (const item of data.items) {
      if (!feedMap.has(item.feedId)) {
        let valueTag: ValueTag | undefined;

        if (item.value) {
          valueTag = {
            type: item.value.model.type,
            method: item.value.model.method,
            suggested: item.value.model.suggested,
            recipients: item.value.destinations.map((dest: any) => ({
              name: dest.name,
              type: dest.type,
              address: dest.address,
              split: dest.split,
              customKey: dest.customKey,
              customValue: dest.customValue,
            })),
          };
        }

        feedMap.set(item.feedId, {
          id: String(item.feedId),
          title: item.feedTitle || item.title,
          artist: item.feedAuthor || 'Unknown Artist',
          album: item.feedTitle,
          duration: item.duration,
          enclosureUrl: item.feedUrl, // RSS feed URL
          artworkUrl: item.feedImage || item.image,
          feedUrl: item.feedUrl,
          guid: String(item.feedId),
          valueTag,
          description: item.description,
        });
      }
    }

    return Array.from(feedMap.values()).slice(0, max);
  } catch (error) {
    console.error('💥 Error getting featured music:', error);
    return [];
  }
}

/**
 * Get a specific track (not supported by simple Worker)
 */
export async function getEpisodeById(id: string): Promise<TrackMetadata | null> {
  console.warn('getEpisodeById not supported by simple Worker proxy');
  return null;
}

/**
 * Check if Podcast Index proxy is available
 */
export function isPodcastIndexAvailable(): boolean {
  return isProxyConfigured;
}

/**
 * Podcast Index music source provider
 */
export const podcastIndexSource: MusicSourceProvider = {
  name: 'Podcast Index',

  async search(query: string): Promise<TrackMetadata[]> {
    return searchPodcastIndex(query);
  },

  async getTrack(id: string): Promise<TrackMetadata | null> {
    return getEpisodeById(id);
  },

  async getFeatured(): Promise<TrackMetadata[]> {
    return getRecentMusic(12);
  },
};
