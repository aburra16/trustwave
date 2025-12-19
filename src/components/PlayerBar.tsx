/**
 * Fixed player bar at the bottom of the screen
 */

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { ZapButton } from '@/components/ZapButton';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PlayerBar() {
  const {
    currentTrack,
    currentListItem,
    isPlaying,
    currentTime,
    duration,
    volume,
    pause,
    resume,
    seek,
    setVolume,
    next,
    previous,
    queue,
    queueIndex,
  } = usePlayer();

  if (!currentTrack) return null;

  const hasNext = queueIndex < queue.length - 1;
  const hasPrevious = queueIndex > 0 || currentTime > 3;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-0 z-50 bg-background/95 backdrop-blur border-t shadow-lg">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-200"
          style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
        />
      </div>

      <div className="container py-2 md:py-3">
        <div className="flex items-center gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack.artworkUrl ? (
              <img
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className="w-12 h-12 md:w-14 md:h-14 rounded-md object-cover shadow-md"
              />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate text-sm md:text-base">{currentTrack.title}</p>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={previous}
              disabled={!hasPrevious}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
              onClick={() => isPlaying ? pause() : resume()}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 md:h-6 md:w-6 fill-white text-white" />
              ) : (
                <Play className="h-5 w-5 md:h-6 md:w-6 fill-white text-white ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={next}
              disabled={!hasNext}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Time & Progress (desktop) */}
          <div className="hidden md:flex items-center gap-2 w-64">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={([value]) => seek(value)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume (desktop) */}
          <div className="hidden lg:flex items-center gap-2 w-32">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => setVolume(value / 100)}
              className="flex-1"
            />
          </div>

          {/* Zap button */}
          {currentTrack.valueTag && (
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950"
              >
                <Zap className="h-4 w-4 fill-amber-500" />
                <span className="hidden lg:inline">Boost</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
