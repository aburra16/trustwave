/**
 * RSS feed parser to extract audio enclosure URLs from podcast feeds
 */

import type { TrackMetadata, ValueTag } from './musicTypes';

interface RSSItem {
  title: string;
  enclosureUrl: string;
  enclosureType?: string;
  duration?: number;
  description?: string;
  guid?: string;
  pubDate?: string;
  itunesImage?: string;
}

/**
 * Parse RSS feed XML and extract audio items
 */
export async function parseRSSFeed(feedUrl: string): Promise<RSSItem[]> {
  try {
    // Use CORS proxy to fetch the feed
    const proxyUrl = `https://proxy.shakespeare.diy/?url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch RSS feed:', response.status);
      return [];
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('XML parsing error:', parseError.textContent);
      return [];
    }
    
    // Extract items from the feed
    const items = xmlDoc.querySelectorAll('item');
    const rssItems: RSSItem[] = [];
    
    items.forEach((item) => {
      const title = item.querySelector('title')?.textContent || 'Untitled';
      const enclosure = item.querySelector('enclosure');
      const enclosureUrl = enclosure?.getAttribute('url');
      const enclosureType = enclosure?.getAttribute('type') || '';
      
      // Only include items with audio enclosures
      if (enclosureUrl && (enclosureType.includes('audio') || enclosureUrl.match(/\.(mp3|m4a|ogg|wav)$/i))) {
        const durationStr = item.querySelector('itunes\\:duration, duration')?.textContent;
        let duration: number | undefined;
        
        // Parse duration (can be in seconds or HH:MM:SS format)
        if (durationStr) {
          if (durationStr.includes(':')) {
            const parts = durationStr.split(':').map(p => parseInt(p));
            if (parts.length === 3) {
              duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
              duration = parts[0] * 60 + parts[1];
            }
          } else {
            duration = parseInt(durationStr);
          }
        }
        
        rssItems.push({
          title,
          enclosureUrl,
          enclosureType,
          duration,
          description: item.querySelector('description')?.textContent || '',
          guid: item.querySelector('guid')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          itunesImage: item.querySelector('itunes\\:image')?.getAttribute('href') || '',
        });
      }
    });
    
    return rssItems;
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return [];
  }
}

/**
 * Get the first playable episode from a podcast feed
 */
export async function getFirstEpisodeFromFeed(feedUrl: string, feedMetadata: Partial<TrackMetadata>): Promise<TrackMetadata | null> {
  const items = await parseRSSFeed(feedUrl);
  
  if (items.length === 0) {
    return null;
  }
  
  // Get the first (most recent) episode
  const episode = items[0];
  
  return {
    id: episode.guid || `episode-${Date.now()}`,
    title: episode.title,
    artist: feedMetadata.artist || 'Unknown Artist',
    album: feedMetadata.title || feedMetadata.album,
    duration: episode.duration,
    enclosureUrl: episode.enclosureUrl,
    artworkUrl: episode.itunesImage || feedMetadata.artworkUrl,
    feedUrl: feedUrl,
    guid: episode.guid,
    valueTag: feedMetadata.valueTag,
    description: episode.description,
  };
}
