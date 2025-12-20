/**
 * Component to browse and select individual tracks from a music feed/album
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Music, Loader2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { TrackMetadata } from '@/lib/musicTypes';
import { getFirstEpisodeFromFeed, parseRSSFeed } from '@/lib/rssParser';
import { cn } from '@/lib/utils';

interface FeedTrackBrowserProps {
  feed: TrackMetadata;
  onSelectTrack: (track: TrackMetadata) => void;
  onBack: () => void;
  addedTrackIds?: Set<string>;
}

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

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function FeedTrackBrowser({ feed, onSelectTrack, onBack, addedTrackIds = new Set() }: FeedTrackBrowserProps) {
  const [tracks, setTracks] = useState<TrackMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, [feed.feedUrl]);

  const loadTracks = async () => {
    if (!feed.feedUrl) {
      setError('No feed URL available');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📻 Loading tracks from feed:', feed.feedUrl);
      const items = await parseRSSFeed(feed.feedUrl);
      
      if (items.length === 0) {
        setError('No tracks found in this feed');
        setTracks([]);
      } else {
        // Convert RSS items to TrackMetadata
        const trackList: TrackMetadata[] = items.map((item, index) => ({
          id: item.guid || `${feed.id}-track-${index}`,
          title: item.title,
          artist: feed.artist,
          album: feed.title,
          duration: item.duration,
          enclosureUrl: item.enclosureUrl,
          artworkUrl: item.itunesImage || feed.artworkUrl,
          feedUrl: feed.feedUrl,
          guid: item.guid,
          valueTag: feed.valueTag,
          description: item.description,
        }));

        console.log(`✅ Loaded ${trackList.length} tracks`);
        setTracks(trackList);
      }
    } catch (err) {
      console.error('Error loading tracks:', err);
      setError('Failed to load tracks from feed');
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and feed info */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Album artwork */}
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
              {feed.artworkUrl ? (
                <img
                  src={feed.artworkUrl}
                  alt={feed.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Music className="w-10 h-10 text-white/80" />
                </div>
              )}
            </div>

            {/* Feed info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{feed.title}</h2>
              <p className="text-sm text-muted-foreground truncate">{feed.artist}</p>
              {feed.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {feed.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Select a track to add
        </h3>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Failed to load tracks</h3>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <Button variant="outline" onClick={loadTracks}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Track list */}
        {!isLoading && !error && tracks.length > 0 && (
          <div className="space-y-2">
            {tracks.map((track, index) => {
              const isAdded = addedTrackIds.has(track.id);
              
              return (
                <Card 
                  key={track.id}
                  className={cn(
                    'transition-all hover:shadow-md cursor-pointer',
                    isAdded && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  )}
                  onClick={() => !isAdded && onSelectTrack(track)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Track number / artwork */}
                      <div className="w-12 h-12 flex-shrink-0 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>

                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {track.duration && (
                            <span>{formatDuration(track.duration)}</span>
                          )}
                          {track.valueTag && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              V4V
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Add button */}
                      {isAdded ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">Added</span>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && tracks.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No tracks found</h3>
              <p className="text-muted-foreground text-sm">
                This feed doesn't contain any playable tracks.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
