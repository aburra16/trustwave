/**
 * Hooks for fetching and creating music lists (kind 9998/39998)
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { parseListEvent, type MusicList } from '@/lib/musicTypes';

/** Fetch all music lists */
export function useMusicLists(limit = 20) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['music-lists', limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{ kinds: [9998, 39998], limit }],
        { signal }
      );

      const lists: MusicList[] = [];
      for (const event of events) {
        const parsed = parseListEvent(event);
        if (parsed) {
          lists.push(parsed);
        }
      }

      // Sort by created_at descending
      return lists.sort((a, b) => b.createdAt - a.createdAt);
    },
    staleTime: 120000, // 2 minutes - lists don't change frequently
  });
}

/** Fetch a single music list by ID */
export function useMusicList(listId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['music-list', listId],
    queryFn: async (c) => {
      if (!listId) return null;

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);

      const events = await nostr.query(
        [{ ids: [listId], kinds: [9998, 39998] }],
        { signal }
      );

      if (events.length === 0) return null;

      return parseListEvent(events[0]);
    },
    enabled: !!listId,
    staleTime: 300000, // 5 minutes - individual lists don't change often
  });
}

/** Fetch music lists by tag/genre */
export function useMusicListsByTag(tag: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['music-lists-by-tag', tag],
    queryFn: async (c) => {
      if (!tag) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{ kinds: [9998, 39998], '#t': [tag.toLowerCase()], limit: 20 }],
        { signal }
      );

      const lists: MusicList[] = [];
      for (const event of events) {
        const parsed = parseListEvent(event);
        if (parsed) {
          lists.push(parsed);
        }
      }

      return lists.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!tag,
    staleTime: 120000,
  });
}

/** Fetch music lists created by a specific user */
export function useMusicListsByAuthor(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['music-lists-by-author', pubkey],
    queryFn: async (c) => {
      if (!pubkey) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);

      const events = await nostr.query(
        [{ kinds: [9998, 39998], authors: [pubkey], limit: 20 }],
        { signal }
      );

      const lists: MusicList[] = [];
      for (const event of events) {
        const parsed = parseListEvent(event);
        if (parsed) {
          lists.push(parsed);
        }
      }

      return lists.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!pubkey,
    staleTime: 120000,
  });
}

/** Search music lists by title or description */
export function useSearchMusicLists(query: string) {
  const { data: allLists, isLoading } = useMusicLists(50);

  if (!query.trim()) {
    return { data: allLists, isLoading };
  }

  const lowerQuery = query.toLowerCase();
  const filtered = allLists?.filter(list =>
    list.title.toLowerCase().includes(lowerQuery) ||
    list.description.toLowerCase().includes(lowerQuery) ||
    list.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );

  return { data: filtered, isLoading };
}
