/**
 * Hook to add a track to a music list (kind 9999)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from './useNostrPublish';
import type { TrackMetadata } from '@/lib/musicTypes';

export interface AddTrackParams {
  listId: string;
  track: TrackMetadata;
  annotation?: string;
}

export function useAddTrackToList() {
  const { mutateAsync: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddTrackParams) => {
      const { listId, track, annotation } = params;

      const eventTags: string[][] = [
        ['z', listId],
        ['r', track.enclosureUrl],
        ['title', track.title],
        ['artist', track.artist],
        ['alt', `Added "${track.title}" by ${track.artist} to playlist`],
      ];

      if (annotation) {
        eventTags.push(['annotation', annotation]);
      }

      if (track.guid) {
        eventTags.push(['guid', track.guid]);
      }

      if (track.feedUrl) {
        eventTags.push(['feed', track.feedUrl]);
      }

      if (track.valueTag) {
        eventTags.push(['value', JSON.stringify(track.valueTag)]);
      }

      if (track.artworkUrl) {
        eventTags.push(['artwork', track.artworkUrl]);
      }

      if (track.duration) {
        eventTags.push(['duration', String(track.duration)]);
      }

      const event = await createEvent({
        kind: 9999,
        content: '',
        tags: eventTags,
      });

      return event;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['list-items', variables.listId] });
      queryClient.invalidateQueries({ queryKey: ['recent-list-items'] });
      queryClient.invalidateQueries({ queryKey: ['trusted-list-items'] });
    },
  });
}
