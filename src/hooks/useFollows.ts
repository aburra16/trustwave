/**
 * Hook to get the follow list for a pubkey (kind 3)
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

export function useFollows(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['follows', pubkey],
    queryFn: async (c) => {
      if (!pubkey) return [];
      
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query(
        [{ kinds: [3], authors: [pubkey], limit: 1 }],
        { signal }
      );
      
      if (events.length === 0) return [];
      
      // Get latest kind 3 event
      const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0];
      
      // Extract p tags (follows)
      const follows = latestEvent.tags
        .filter(([k]) => k === 'p')
        .map(([, pubkey]) => pubkey)
        .filter(Boolean);
      
      return follows;
    },
    enabled: !!pubkey,
    staleTime: 60000, // 1 minute
  });
}
