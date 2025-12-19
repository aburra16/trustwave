/**
 * Podcast Index API integration
 * https://podcastindex-org.github.io/docs-api/
 * 
 * The API requires both an API Key and API Secret for authentication.
 * Authorization = sha1(apiKey + apiSecret + unixTime)
 * 
 * Since direct browser calls face CORS issues with custom auth headers,
 * we use a CORS proxy that can forward headers properly.
 */

import type { TrackMetadata, ValueTag, MusicSourceProvider } from './musicTypes';

const API_BASE = 'https://api.podcastindex.org/api/1.0';
const API_KEY = 'QR3MNNMGKTRHXAD9NKBL';
const API_SECRET = '#$LTq8HngFFLZ8bRMqU^wSukj5E6tEPe$RKbsaRR';

// Use allorigins.win as CORS proxy - it preserves the response
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

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
 * Generate SHA-1 hash using Web Crypto API
 */
async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Build URL with auth query parameters
 * Since we can't pass headers through most CORS proxies, 
 * we'll need to see if the API accepts query params (it doesn't officially)
 * OR use a different approach entirely
 */
async function buildAuthenticatedUrl(endpoint: string): Promise<string> {
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const data4Hash = API_KEY + API_SECRET + apiHeaderTime;
  const hashHex = await sha1(data4Hash);
  
  // The Podcast Index API requires these as headers, but we'll try encoding them
  // into a format that might work with certain proxies
  const baseUrl = `${API_BASE}${endpoint}`;
  const separator = endpoint.includes('?') ? '&' : '?';
  
  // Some CORS proxies allow passing headers as query params
  return `${baseUrl}${separator}_podcastindex_auth=${encodeURIComponent(JSON.stringify({
    key: API_KEY,
    time: apiHeaderTime,
    hash: hashHex
  }))}`;
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
 * Convert Podcast Index feed to TrackMetadata (for feed search results)
 * Note: Feeds don't have direct audio URLs, so we use a placeholder
 */
function feedToTrack(feed: PodcastIndexFeed): TrackMetadata {
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
    id: `feed-${feed.id}`,
    title: feed.title,
    artist: feed.author || 'Unknown Artist',
    album: feed.title,
    duration: undefined,
    enclosureUrl: '', // Feeds don't have direct audio
    artworkUrl: feed.artwork || feed.image,
    feedUrl: feed.url,
    guid: String(feed.id),
    valueTag,
    description: feed.description,
  };
}

/**
 * Make authenticated request to Podcast Index API via fetch with headers
 * This works if the API has proper CORS headers (Access-Control-Allow-*)
 */
async function podcastIndexFetch(endpoint: string): Promise<Response> {
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const data4Hash = API_KEY + API_SECRET + apiHeaderTime;
  const hashHex = await sha1(data4Hash);
  
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Date': String(apiHeaderTime),
        'X-Auth-Key': API_KEY,
        'Authorization': hashHex,
        'User-Agent': 'TrustWave/1.0',
      },
    });
    return response;
  } catch (error) {
    // If CORS fails, the fetch will throw
    console.error('Direct fetch failed (likely CORS):', error);
    throw error;
  }
}

/**
 * Search for podcasts/music on Podcast Index
 */
export async function searchPodcastIndex(query: string): Promise<TrackMetadata[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await podcastIndexFetch(`/search/byterm?q=${encodedQuery}&max=20`);
    
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
      // For each feed, we should ideally get episodes, but for now return feed info
      // Filter out feeds without audio content indicators
      const validFeeds = data.feeds.filter(f => f.episodeCount && f.episodeCount > 0);
      
      // Try to get episodes for the first few feeds
      const tracksPromises = validFeeds.slice(0, 5).map(async (feed) => {
        try {
          const episodesResponse = await podcastIndexFetch(`/episodes/byfeedid?id=${feed.id}&max=3`);
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
 * Get recent episodes from Podcast Index
 */
export async function getRecentMusic(max = 20): Promise<TrackMetadata[]> {
  try {
    // Use recent/episodes endpoint
    const response = await podcastIndexFetch(`/recent/episodes?max=${max}&lang=en`);
    
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
 * Get episode by ID
 */
export async function getEpisodeById(id: string): Promise<TrackMetadata | null> {
  try {
    // Handle feed IDs (from search results)
    if (id.startsWith('feed-')) {
      return null;
    }
    
    const response = await podcastIndexFetch(`/episodes/byid?id=${id}`);
    
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
