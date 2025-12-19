/**
 * Hook to create a new music list (kind 9998)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from './useNostrPublish';

export interface CreateListParams {
  title: string;
  description: string;
  image?: string;
  tags: string[];
}

export function useCreateList() {
  const { mutateAsync: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateListParams) => {
      const eventTags: string[][] = [
        ['names', 'playlist', 'playlists'],
        ['title', params.title],
        ['description', params.description],
        ['required', 'r'],
        ['recommended', 'title', 'artist', 'annotation'],
        ['alt', `Music playlist: ${params.title}`],
      ];

      if (params.image) {
        eventTags.push(['image', params.image]);
      }

      for (const tag of params.tags) {
        eventTags.push(['t', tag.toLowerCase()]);
      }

      const event = await createEvent({
        kind: 9998,
        content: '',
        tags: eventTags,
      });

      return event;
    },
    onSuccess: () => {
      // Invalidate lists queries
      queryClient.invalidateQueries({ queryKey: ['music-lists'] });
      queryClient.invalidateQueries({ queryKey: ['recent-list-items'] });
    },
  });
}
