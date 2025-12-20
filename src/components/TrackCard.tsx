/**
 * Card component for displaying a track
 */

import { Play, Pause, Plus, MoreHorizontal, Zap, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuthor } from '@/hooks/useAuthor';
import { useIsInWot } from '@/hooks/useWebOfTrust';
import type { TrackMetadata, ListItem } from '@/lib/musicTypes';
import { cn } from '@/lib/utils';
import { genUserName } from '@/lib/genUserName';

interface TrackCardProps {
  track: TrackMetadata;
  listItem?: ListItem;
  onAddToList?: () => void;
  showAddedBy?: boolean;
  compact?: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TrackCard({
  track,
  listItem,
  onAddToList,
  showAddedBy = false,
  compact = false
}: TrackCardProps) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayer();

  // Check if this is the current track
  // For podcast feeds, we need to check feedUrl since the enclosureUrl changes when resolved to an episode
  const isCurrentTrack = currentTrack && (
    currentTrack.enclosureUrl === track.enclosureUrl ||
    (track.feedUrl && currentTrack.feedUrl === track.feedUrl) ||
    (track.guid && currentTrack.guid === track.guid)
  );

  // If we have a listItem, show who added it
  const author = useAuthor(listItem?.pubkey);
  const { isInWot, depth } = useIsInWot(listItem?.pubkey);

  const handlePlayClick = () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      play(track, listItem);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50 group cursor-pointer',
          isCurrentTrack && 'bg-violet-50 dark:bg-violet-900/20'
        )}
        onClick={handlePlayClick}
      >
        {/* Artwork */}
        <div className="relative w-10 h-10 flex-shrink-0">
          {track.artworkUrl ? (
            <img
              src={track.artworkUrl}
              alt={track.title}
              className="w-full h-full rounded object-cover"
            />
          ) : (
            <div className="w-full h-full rounded bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          )}
          <div className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity',
            isCurrentTrack && isPlaying && 'opacity-100'
          )}>
            {isCurrentTrack && isPlaying ? (
              <Pause className="h-4 w-4 text-white fill-white" />
            ) : (
              <Play className="h-4 w-4 text-white fill-white" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium text-sm truncate',
            isCurrentTrack && 'text-violet-600 dark:text-violet-400'
          )}>
            {track.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        </div>

        {/* Duration */}
        {track.duration && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(track.duration)}
          </span>
        )}

        {/* V4V indicator */}
        {track.valueTag && (
          <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
        )}
      </div>
    );
  }

  return (
    <Card className={cn(
      'group overflow-hidden transition-all hover:shadow-lg',
      isCurrentTrack && 'ring-2 ring-violet-500'
    )}>
      {/* Artwork */}
      <div className="relative aspect-square">
        {track.artworkUrl ? (
          <img
            src={track.artworkUrl}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
        )}

        {/* Play overlay */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity',
          isCurrentTrack && isPlaying && 'opacity-100'
        )}>
          <Button
            variant="default"
            size="icon"
            className="h-14 w-14 rounded-full bg-white/90 hover:bg-white text-violet-600 shadow-xl"
            onClick={handlePlayClick}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="h-7 w-7 fill-current" />
            ) : (
              <Play className="h-7 w-7 fill-current ml-1" />
            )}
          </Button>
        </div>

        {/* V4V badge */}
        {track.valueTag && (
          <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 gap-1">
            <Zap className="h-3 w-3 fill-white" />
            V4V
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{track.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>

            {track.duration && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(track.duration)}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAddToList && (
                <DropdownMenuItem onClick={onAddToList}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to List
                </DropdownMenuItem>
              )}
              {track.valueTag && (
                <DropdownMenuItem>
                  <Zap className="h-4 w-4 mr-2" />
                  Boost Artist
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Added by info */}
        {showAddedBy && listItem && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Added by</span>
            <span className="font-medium text-foreground">
              {author.data?.metadata?.name || genUserName(listItem.pubkey)}
            </span>
            {isInWot && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                {depth === 0 ? 'Following' : 'Depth 1'}
              </Badge>
            )}
          </div>
        )}

        {/* Annotation */}
        {listItem?.annotation && (
          <p className="mt-2 text-sm italic text-muted-foreground bg-muted/50 rounded p-2">
            "{listItem.annotation}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}
