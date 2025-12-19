/**
 * Podcast Index API integration
 * https://podcastindex-org.github.io/docs-api/
 * 
 * The API requires both an API Key and API Secret for authentication.
 * Authorization = sha1(apiKey + apiSecret + unixTime)
 */

import type { TrackMetadata, ValueTag, MusicSourceProvider } from './musicTypes';

const API_BASE = 'https://api.podcastindex.org/api/1.0';
const API_KEY = 'QR3MNNMGKTRHXAD9NKBL';
const API_SECRET = '#$LTq8HngFFLZ8bRMqU^wSukj5E6tEPe$RKbsaRR';

const CORS_PROXY = 'https://proxy.shakespeare.diy/?url=';

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
  items: PodcastIndexEpisode[];
  count: number;
  query: string;
  description: string;
}

interface PodcastIndexMusicResponse {
  status: string;
  items: PodcastIndexEpisode[];
  count: number;
  description: string;
}

/**
 * Generate auth headers for Podcast Index API
 * The API requires: X-Auth-Date, X-Auth-Key, and Authorization (sha1 hash of key+secret+time)
 */
async function generateAuthHeaders(): Promise<Record<string, string>> {
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  // The hash must be: sha1(apiKey + apiSecret + unixTime)
  const data4Hash = API_KEY + API_SECRET + apiHeaderTime;
  
  // Generate SHA-1 hash
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data4Hash);
  const hashBuffer = await crypto.subtle.digest('SHA-1', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return {
    'X-Auth-Date': String(apiHeaderTime),
    'X-Auth-Key': API_KEY,
    'Authorization': hashHex,
    'User-Agent': 'TrustWave/1.0',
  };
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
 * Search for music/podcasts on Podcast Index
 */
export async function searchPodcastIndex(query: string): Promise<TrackMetadata[]> {
  try {
    const authHeaders = await generateAuthHeaders();
    const encodedQuery = encodeURIComponent(query);
    const url = `${API_BASE}/search/music/byterm?q=${encodedQuery}&max=20`;
    
    const response = await fetch(CORS_PROXY + encodeURIComponent(url), {
      method: 'GET',
      headers: {
        ...authHeaders,
      },
    });
    
    if (!response.ok) {
      console.error('Podcast Index search failed:', response.status, response.statusText);
      return [];
    }
    
    const data: PodcastIndexSearchResponse = await response.json();
    
    if (data.status !== 'true' || !data.items) {
      return [];
    }
    
    return data.items.map(episodeToTrack);
  } catch (error) {
    console.error('Error searching Podcast Index:', error);
    return [];
  }
}

/**
 * Get recent music episodes from Podcast Index
 */
export async function getRecentMusic(max = 20): Promise<TrackMetadata[]> {
  try {
    const authHeaders = await generateAuthHeaders();
    const url = `${API_BASE}/recent/music?max=${max}`;
    
    const response = await fetch(CORS_PROXY + encodeURIComponent(url), {
      method: 'GET',
      headers: {
        ...authHeaders,
      },
    });
    
    if (!response.ok) {
      console.error('Podcast Index recent music failed:', response.status, response.statusText);
      return [];
    }
    
    const data: PodcastIndexMusicResponse = await response.json();
    
    if (data.status !== 'true' || !data.items) {
      return [];
    }
    
    return data.items.map(episodeToTrack);
  } catch (error) {
    console.error('Error fetching recent music:', error);
    return [];
  }
}

/**
 * Get episode by ID
 */
export async function getEpisodeById(id: string): Promise<TrackMetadata | null> {
  try {
    const authHeaders = await generateAuthHeaders();
    const url = `${API_BASE}/episodes/byid?id=${id}`;
    
    const response = await fetch(CORS_PROXY + encodeURIComponent(url), {
      method: 'GET',
      headers: {
        ...authHeaders,
      },
    });
    
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
