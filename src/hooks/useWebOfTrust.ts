/**
 * Hook to calculate the Web-of-Trust graph for a user
 * Depth 0 = users the current user follows
 * Depth 1 = users that Depth 0 users follow
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';

export interface WotGraph {
  depth0: Set<string>; // Direct follows
  depth1: Set<string>; // Follows of follows
  all: Set<string>;    // Combined set
}

export function useWebOfTrust() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['wot', user?.pubkey],
    queryFn: async (c): Promise<WotGraph> => {
      if (!user?.pubkey) {
        return { depth0: new Set(), depth1: new Set(), all: new Set() };
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      // Get the current user's follows (Depth 0)
      const userFollowEvents = await nostr.query(
        [{ kinds: [3], authors: [user.pubkey], limit: 1 }],
        { signal }
      );

      const depth0 = new Set<string>();
      
      if (userFollowEvents.length > 0) {
        const latestEvent = userFollowEvents.sort((a, b) => b.created_at - a.created_at)[0];
        latestEvent.tags
          .filter(([k]) => k === 'p')
          .forEach(([, pubkey]) => {
            if (pubkey) depth0.add(pubkey);
          });
      }

      // If no follows, return early
      if (depth0.size === 0) {
        return { depth0, depth1: new Set(), all: new Set([user.pubkey]) };
      }

      // Get follows of follows (Depth 1)
      // Batch the queries to avoid overwhelming relays
      const depth0Array = Array.from(depth0);
      const batchSize = 50;
      const depth1 = new Set<string>();

      for (let i = 0; i < depth0Array.length; i += batchSize) {
        const batch = depth0Array.slice(i, i + batchSize);
        
        try {
          const followsOfFollows = await nostr.query(
            [{ kinds: [3], authors: batch, limit: batch.length }],
            { signal }
          );

          // Group by author and get latest event for each
          const latestByAuthor = new Map<string, typeof followsOfFollows[0]>();
          for (const event of followsOfFollows) {
            const existing = latestByAuthor.get(event.pubkey);
            if (!existing || event.created_at > existing.created_at) {
              latestByAuthor.set(event.pubkey, event);
            }
          }

          // Extract all follows
          for (const event of latestByAuthor.values()) {
            event.tags
              .filter(([k]) => k === 'p')
              .forEach(([, pubkey]) => {
                if (pubkey && !depth0.has(pubkey) && pubkey !== user.pubkey) {
                  depth1.add(pubkey);
                }
              });
          }
        } catch (error) {
          console.warn('Error fetching follows batch:', error);
        }
      }

      // Combine all trusted pubkeys
      const all = new Set([user.pubkey, ...depth0, ...depth1]);

      return { depth0, depth1, all };
    },
    enabled: !!user?.pubkey,
    staleTime: 300000, // 5 minutes - WoT doesn't change frequently
    gcTime: Infinity,
  });
}

/** Check if a pubkey is in the user's Web of Trust */
export function useIsInWot(pubkey: string | undefined) {
  const { data: wot, isLoading } = useWebOfTrust();
  
  if (!pubkey || !wot) {
    return { isInWot: false, depth: null as number | null, isLoading };
  }
  
  if (wot.depth0.has(pubkey)) {
    return { isInWot: true, depth: 0, isLoading };
  }
  
  if (wot.depth1.has(pubkey)) {
    return { isInWot: true, depth: 1, isLoading };
  }
  
  return { isInWot: false, depth: null, isLoading };
}
