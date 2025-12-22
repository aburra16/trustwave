/**
 * Hook to calculate the Web-of-Trust graph for a user
 * Depth 0 = users the current user follows
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';

export interface WotGraph {
  depth0: Set<string>; // Direct follows
  all: Set<string>;    // All trusted pubkeys (depth0 + self)
}

export function useWebOfTrust() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['wot', user?.pubkey],
    queryFn: async (c): Promise<WotGraph> => {
      if (!user?.pubkey) {
        return { depth0: new Set(), all: new Set() };
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

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

      // Combine all trusted pubkeys (self + direct follows)
      const all = new Set([user.pubkey, ...depth0]);

      return { depth0, all };
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

  return { isInWot: false, depth: null, isLoading };
}
