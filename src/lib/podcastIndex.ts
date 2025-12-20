/**
 * Podcast Index API integration via Cloudflare Worker proxy
 * 
 * The Worker handles authentication and CORS, and exposes a simple endpoint:
 * GET /?q=searchterm
 * 
 * This returns search results from Podcast Index's /search/byterm endpoint.
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
 * Search for music/podcasts on Podcast Index via Worker proxy
 */
export async function searchPodcastIndex(query: string): Promise<TrackMetadata[]> {
  if (!isProxyConfigured) {
    console.warn('Podcast Index proxy not configured');
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const fetchUrl = `${PROXY_URL}?q=${encodedQuery}`;
    console.log('🔍 Searching Podcast Index:', fetchUrl);
    
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
 * Get recent/featured music by searching for "music"
 */
export async function getRecentMusic(max = 20): Promise<TrackMetadata[]> {
  console.log('🎵 Getting featured music...');
  // Use a generic search to get featured content
  return searchPodcastIndex('music');
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
