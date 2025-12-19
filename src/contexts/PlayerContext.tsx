/**
 * Audio player context for managing playback state
 */

import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { TrackMetadata, ListItem } from '@/lib/musicTypes';

interface PlayerContextValue {
  // Current state
  currentTrack: TrackMetadata | null;
  currentListItem: ListItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Queue
  queue: TrackMetadata[];
  queueIndex: number;
  
  // Actions
  play: (track: TrackMetadata, listItem?: ListItem) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  setQueue: (tracks: TrackMetadata[], startIndex?: number) => void;
  addToQueue: (track: TrackMetadata) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [currentTrack, setCurrentTrack] = useState<TrackMetadata | null>(null);
  const [currentListItem, setCurrentListItem] = useState<ListItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [queue, setQueueState] = useState<TrackMetadata[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        // Auto-play next in queue
        if (queueIndex < queue.length - 1) {
          setQueueIndex(prev => prev + 1);
        }
      });
      
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Handle queue changes
  useEffect(() => {
    if (queue.length > 0 && queueIndex < queue.length) {
      const track = queue[queueIndex];
      if (track !== currentTrack) {
        setCurrentTrack(track);
        if (audioRef.current) {
          audioRef.current.src = track.enclosureUrl;
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [queueIndex, queue]);

  const play = useCallback((track: TrackMetadata, listItem?: ListItem) => {
    setCurrentTrack(track);
    setCurrentListItem(listItem || null);
    
    if (audioRef.current) {
      audioRef.current.src = track.enclosureUrl;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTrack(null);
    setCurrentListItem(null);
    setIsPlaying(false);
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clampedVol = Math.max(0, Math.min(1, vol));
    setVolumeState(clampedVol);
    if (audioRef.current) {
      audioRef.current.volume = clampedVol;
    }
  }, []);

  const next = useCallback(() => {
    if (queueIndex < queue.length - 1) {
      setQueueIndex(prev => prev + 1);
    }
  }, [queueIndex, queue.length]);

  const previous = useCallback(() => {
    if (queueIndex > 0) {
      setQueueIndex(prev => prev - 1);
    } else if (audioRef.current) {
      // Restart current track
      audioRef.current.currentTime = 0;
    }
  }, [queueIndex]);

  const setQueue = useCallback((tracks: TrackMetadata[], startIndex = 0) => {
    setQueueState(tracks);
    setQueueIndex(startIndex);
  }, []);

  const addToQueue = useCallback((track: TrackMetadata) => {
    setQueueState(prev => [...prev, track]);
  }, []);

  const value: PlayerContextValue = {
    currentTrack,
    currentListItem,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    queueIndex,
    play,
    pause,
    resume,
    stop,
    seek,
    setVolume,
    next,
    previous,
    setQueue,
    addToQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
