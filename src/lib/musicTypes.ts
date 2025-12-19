/**
 * Type definitions for the music curation app
 */

import type { NostrEvent } from '@nostrify/nostrify';

/** A music playlist (kind 9998 event) */
export interface MusicList {
  id: string;
  pubkey: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  createdAt: number;
  event: NostrEvent;
}

/** A track added to a playlist (kind 9999 event) */
export interface ListItem {
  id: string;
  pubkey: string;
  listId: string;
  trackUrl: string;
  title: string;
  artist: string;
  annotation?: string;
  guid?: string;
  feedUrl?: string;
  valueTag?: string;
  createdAt: number;
  event: NostrEvent;
}

/** Track metadata from RSS/Podcast Index */
export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  enclosureUrl: string;
  artworkUrl?: string;
  feedUrl?: string;
  guid?: string;
  valueTag?: ValueTag;
  description?: string;
}

/** V4V value tag for Lightning payments */
export interface ValueTag {
  type: string;
  method: string;
  suggested?: string;
  recipients: ValueRecipient[];
}

export interface ValueRecipient {
  name?: string;
  type: string;
  address: string;
  split: number;
  customKey?: string;
  customValue?: string;
}

/** Activity feed item */
export interface ActivityItem {
  id: string;
  type: 'list_created' | 'track_added';
  pubkey: string;
  timestamp: number;
  list?: MusicList;
  track?: ListItem;
  listTitle?: string;
}

/** Web-of-Trust depth levels */
export type WotDepth = 0 | 1;

/** Trust filter mode */
export type TrustFilter = 'global' | 'trusted';

/** Music source provider interface */
export interface MusicSourceProvider {
  name: string;
  search(query: string): Promise<TrackMetadata[]>;
  getTrack(id: string): Promise<TrackMetadata | null>;
  getFeatured?(): Promise<TrackMetadata[]>;
}

/** Player state */
export interface PlayerState {
  currentTrack: TrackMetadata | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: TrackMetadata[];
  queueIndex: number;
}

/** Curator starter pack */
export interface StarterPack {
  genre: string;
  displayName: string;
  description: string;
  curators: string[]; // pubkeys
}

/** Parse a kind 9998 event into a MusicList */
export function parseListEvent(event: NostrEvent): MusicList | null {
  if (event.kind !== 9998 && event.kind !== 39998) return null;
  
  const title = event.tags.find(([k]) => k === 'title')?.[1] || 
                event.tags.find(([k]) => k === 'names')?.[1] || 'Untitled';
  const description = event.tags.find(([k]) => k === 'description')?.[1] || '';
  const image = event.tags.find(([k]) => k === 'image')?.[1];
  const tags = event.tags.filter(([k]) => k === 't').map(([, v]) => v);
  
  return {
    id: event.id,
    pubkey: event.pubkey,
    title,
    description,
    image,
    tags,
    createdAt: event.created_at,
    event,
  };
}

/** Parse a kind 9999 event into a ListItem */
export function parseListItemEvent(event: NostrEvent): ListItem | null {
  if (event.kind !== 9999 && event.kind !== 39999) return null;
  
  const listId = event.tags.find(([k]) => k === 'z')?.[1];
  const trackUrl = event.tags.find(([k]) => k === 'r')?.[1];
  
  if (!listId || !trackUrl) return null;
  
  const title = event.tags.find(([k]) => k === 'title')?.[1] || 'Unknown Track';
  const artist = event.tags.find(([k]) => k === 'artist')?.[1] || 'Unknown Artist';
  const annotation = event.tags.find(([k]) => k === 'annotation')?.[1];
  const guid = event.tags.find(([k]) => k === 'guid')?.[1];
  const feedUrl = event.tags.find(([k]) => k === 'feed')?.[1];
  const valueTag = event.tags.find(([k]) => k === 'value')?.[1];
  
  return {
    id: event.id,
    pubkey: event.pubkey,
    listId,
    trackUrl,
    title,
    artist,
    annotation,
    guid,
    feedUrl,
    valueTag,
    createdAt: event.created_at,
    event,
  };
}
