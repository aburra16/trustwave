/**
 * Hook to fetch track duration from RSS feed if not already available
 */

import { useQuery } from '@tanstack/react-query';
import { getFirstEpisodeFromFeed } from '@/lib/rssParser';
import type { TrackMetadata } from '@/lib/musicTypes';

export function useTrackDuration(track: TrackMetadata) {
  return useQuery({
    queryKey: ['track-duration', track.feedUrl, track.id],
    queryFn: async (c) => {
      if (!track.feedUrl) return null;
      
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      
      try {
        const episode = await getFirstEpisodeFromFeed(track.feedUrl, track);
        return episode?.duration || null;
      } catch (error) {
        console.error('Error fetching track duration:', error);
        return null;
      }
    },
    // Only fetch if track is a podcast feed and doesn't have duration
    enabled: !track.duration && !!track.feedUrl,
    staleTime: Infinity, // Duration doesn't change, cache forever
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
}
