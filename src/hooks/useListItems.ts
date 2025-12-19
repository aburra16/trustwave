/**
 * Hooks for fetching list items (kind 9999/39999) - tracks added to playlists
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { parseListItemEvent, type ListItem } from '@/lib/musicTypes';
import { useWebOfTrust } from './useWebOfTrust';
import type { TrustFilter } from '@/lib/musicTypes';

/** Fetch all items for a specific list */
export function useListItems(listId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['list-items', listId],
    queryFn: async (c) => {
      if (!listId) return [];
      
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);
      
      const events = await nostr.query(
        [{ kinds: [9999, 39999], '#z': [listId], limit: 200 }],
        { signal }
      );

      const items: ListItem[] = [];
      for (const event of events) {
        const parsed = parseListItemEvent(event);
        if (parsed) {
          items.push(parsed);
        }
      }

      // Sort by created_at descending (newest first)
      return items.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!listId,
    staleTime: 30000,
  });
}

/** Fetch list items with Web-of-Trust filtering */
export function useFilteredListItems(listId: string | undefined, filter: TrustFilter) {
  const { data: items, isLoading: itemsLoading } = useListItems(listId);
  const { data: wot, isLoading: wotLoading } = useWebOfTrust();

  const isLoading = itemsLoading || (filter === 'trusted' && wotLoading);

  if (!items) {
    return { data: undefined, isLoading };
  }

  if (filter === 'global' || !wot) {
    return { data: items, isLoading };
  }

  // Filter by Web-of-Trust
  const filtered = items.filter(item => wot.all.has(item.pubkey));
  
  return { data: filtered, isLoading };
}

/** Fetch recent list items across all lists (for activity feed) */
export function useRecentListItems(limit = 50) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['recent-list-items', limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);
      
      const events = await nostr.query(
        [{ kinds: [9999, 39999], limit }],
        { signal }
      );

      const items: ListItem[] = [];
      for (const event of events) {
        const parsed = parseListItemEvent(event);
        if (parsed) {
          items.push(parsed);
        }
      }

      return items.sort((a, b) => b.createdAt - a.createdAt);
    },
    staleTime: 30000,
  });
}

/** Fetch list items added by users in the Web-of-Trust */
export function useTrustedListItems(limit = 50) {
  const { nostr } = useNostr();
  const { data: wot, isLoading: wotLoading } = useWebOfTrust();

  return useQuery({
    queryKey: ['trusted-list-items', limit, wot ? Array.from(wot.all).sort().join(',') : ''],
    queryFn: async (c) => {
      if (!wot || wot.all.size === 0) return [];
      
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);
      
      // Query for items from trusted users
      const trustedPubkeys = Array.from(wot.all);
      const batchSize = 100;
      const allItems: ListItem[] = [];

      for (let i = 0; i < trustedPubkeys.length; i += batchSize) {
        const batch = trustedPubkeys.slice(i, i + batchSize);
        
        try {
          const events = await nostr.query(
            [{ kinds: [9999, 39999], authors: batch, limit: Math.min(limit, 100) }],
            { signal }
          );

          for (const event of events) {
            const parsed = parseListItemEvent(event);
            if (parsed) {
              allItems.push(parsed);
            }
          }
        } catch (error) {
          console.warn('Error fetching trusted items batch:', error);
        }
      }

      // Sort and limit
      return allItems
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    },
    enabled: !!wot && wot.all.size > 0 && !wotLoading,
    staleTime: 30000,
  });
}

/** Fetch list items added by a specific user */
export function useListItemsByAuthor(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['list-items-by-author', pubkey],
    queryFn: async (c) => {
      if (!pubkey) return [];
      
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      const events = await nostr.query(
        [{ kinds: [9999, 39999], authors: [pubkey], limit: 100 }],
        { signal }
      );

      const items: ListItem[] = [];
      for (const event of events) {
        const parsed = parseListItemEvent(event);
        if (parsed) {
          items.push(parsed);
        }
      }

      return items.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!pubkey,
    staleTime: 30000,
  });
}
