/**
 * Podcast Index API integration
 * https://podcastindex-org.github.io/docs-api/
 * 
 * This module uses a Cloudflare Worker proxy to make authenticated requests
 * to the Podcast Index API, solving CORS issues and keeping the API secret secure.
 * 
 * Setup:
 * 1. Deploy the Cloudflare Worker from /cloudflare-worker/index.ts
 * 2. Set VITE_PI_PROXY_URL in your .env file
 * 3. If no proxy URL is set, the app falls back to mock data
 */

import type { TrackMetadata, ValueTag, MusicSourceProvider } from './musicTypes';

// Get proxy URL from environment variable
const PROXY_URL = import.meta.env.VITE_PI_PROXY_URL || '';

// Check if proxy is configured
const isProxyConfigured = Boolean(PROXY_URL);

interface PodcastIndexEpisode {
  id: number;
  title: string;
  link: string;
  description: string;
  guid: string;
  datePublished: number;
  datePublishedPretty: string;
  dateCrawled: number;
  enclosureUrl: string;
  enclosureType: string;
  enclosureLength: number;
  duration: number;
  explicit: number;
  episode: number;
  episodeType: string;
  season: number;
  image: string;
  feedItunesId: number;
  feedImage: string;
  feedId: number;
  feedLanguage: string;
  feedDead: number;
  feedDuplicateOf: number;
  chaptersUrl: string;
  transcriptUrl: string;
  soundbite: unknown;
  soundbites: unknown[];
  persons: unknown[];
  socialInteract: unknown[];
  value: PodcastIndexValue | null;
  feedTitle?: string;
  feedUrl?: string;
}

interface PodcastIndexValue {
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
}

interface PodcastIndexSearchResponse {
  status: string;
  feeds?: PodcastIndexFeed[];
  items?: PodcastIndexEpisode[];
  count: number;
  query?: string;
  description: string;
}

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
  value?: PodcastIndexValue;
  episodeCount?: number;
}

interface PodcastIndexEpisodesResponse {
  status: string;
  items: PodcastIndexEpisode[];
  count: number;
  description: string;
}

/**
 * Convert Podcast Index episode to our TrackMetadata format
 */
function episodeToTrack(episode: PodcastIndexEpisode): TrackMetadata {
  let valueTag: ValueTag | undefined;
  
  if (episode.value) {
    valueTag = {
      type: episode.value.model.type,
      method: episode.value.model.method,
      suggested: episode.value.model.suggested,
      recipients: episode.value.destinations.map(dest => ({
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
    id: String(episode.id),
    title: episode.title,
    artist: episode.feedTitle || 'Unknown Artist',
    album: episode.feedTitle,
    duration: episode.duration,
    enclosureUrl: episode.enclosureUrl,
    artworkUrl: episode.image || episode.feedImage,
    feedUrl: episode.feedUrl,
    guid: episode.guid,
    valueTag,
    description: episode.description,
  };
}

/**
 * Search for podcasts/music on Podcast Index via proxy
 */
export async function searchPodcastIndex(query: string): Promise<TrackMetadata[]> {
  if (!isProxyConfigured) {
    console.warn('Podcast Index proxy not configured. Set VITE_PI_PROXY_URL in .env');
    return [];
  }
  
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${PROXY_URL}/search?q=${encodedQuery}&max=20`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Podcast Index search failed:', response.status, errorText);
      return [];
    }
    
    const data: PodcastIndexSearchResponse = await response.json();
    
    if (data.status !== 'true') {
      console.error('Podcast Index returned error status:', data);
      return [];
    }
    
    // The search/byterm endpoint returns feeds
    if (data.feeds && data.feeds.length > 0) {
      // For each feed, get episodes
      const validFeeds = data.feeds.filter(f => f.episodeCount && f.episodeCount > 0);
      
      // Try to get episodes for the first few feeds
      const tracksPromises = validFeeds.slice(0, 5).map(async (feed) => {
        try {
          const episodesResponse = await fetch(`${PROXY_URL}/episodes/byfeedid?id=${feed.id}&max=3`);
          if (episodesResponse.ok) {
            const episodesData: PodcastIndexEpisodesResponse = await episodesResponse.json();
            if (episodesData.status === 'true' && episodesData.items) {
              return episodesData.items.map(ep => ({
                ...episodeToTrack(ep),
                artist: feed.author || feed.title,
                artworkUrl: ep.image || ep.feedImage || feed.artwork || feed.image,
              }));
            }
          }
        } catch (e) {
          console.warn('Failed to fetch episodes for feed:', feed.id);
        }
        return [];
      });
      
      const trackArrays = await Promise.all(tracksPromises);
      return trackArrays.flat();
    }
    
    return [];
  } catch (error) {
    console.error('Error searching Podcast Index:', error);
    return [];
  }
}

/**
 * Get recent episodes from Podcast Index via proxy
 */
export async function getRecentMusic(max = 20): Promise<TrackMetadata[]> {
  if (!isProxyConfigured) {
    console.warn('Podcast Index proxy not configured. Set VITE_PI_PROXY_URL in .env');
    return [];
  }
  
  try {
    const response = await fetch(`${PROXY_URL}/recent?max=${max}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Podcast Index recent failed:', response.status, errorText);
      return [];
    }
    
    const data: PodcastIndexEpisodesResponse = await response.json();
    
    if (data.status !== 'true' || !data.items) {
      return [];
    }
    
    // Filter to only episodes with valid audio URLs
    const validEpisodes = data.items.filter(ep => 
      ep.enclosureUrl && 
      (ep.enclosureType?.includes('audio') || ep.enclosureUrl.match(/\.(mp3|m4a|ogg|wav)$/i))
    );
    
    return validEpisodes.map(episodeToTrack);
  } catch (error) {
    console.error('Error fetching recent from Podcast Index:', error);
    return [];
  }
}

/**
 * Get episode by ID via proxy
 */
export async function getEpisodeById(id: string): Promise<TrackMetadata | null> {
  if (!isProxyConfigured) {
    console.warn('Podcast Index proxy not configured. Set VITE_PI_PROXY_URL in .env');
    return null;
  }
  
  try {
    // Handle feed IDs (from search results)
    if (id.startsWith('feed-')) {
      return null;
    }
    
    const response = await fetch(`${PROXY_URL}/episodes/byid?id=${id}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.status !== 'true' || !data.episode) {
      return null;
    }
    
    return episodeToTrack(data.episode);
  } catch (error) {
    console.error('Error fetching episode:', error);
    return null;
  }
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
