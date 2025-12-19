/**
 * Dialog for adding a track to a list
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Plus, Loader2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusicListsByAuthor } from '@/hooks/useMusicLists';
import { useAddTrackToList } from '@/hooks/useAddTrackToList';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import type { TrackMetadata, MusicList } from '@/lib/musicTypes';
import { cn } from '@/lib/utils';

interface AddToListDialogProps {
  track: TrackMetadata;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToListDialog({ track, open, onOpenChange }: AddToListDialogProps) {
  const { user } = useCurrentUser();
  const { data: myLists, isLoading } = useMusicListsByAuthor(user?.pubkey);
  const { mutateAsync: addTrack, isPending } = useAddTrackToList();
  const { toast } = useToast();

  const [selectedList, setSelectedList] = useState<MusicList | null>(null);
  const [annotation, setAnnotation] = useState('');
  const [addedToLists, setAddedToLists] = useState<Set<string>>(new Set());

  const handleAddToList = async (list: MusicList) => {
    try {
      await addTrack({
        listId: list.id,
        track,
        annotation: annotation.trim() || undefined,
      });

      setAddedToLists(prev => new Set(prev).add(list.id));
      
      toast({
        title: 'Track added!',
        description: `"${track.title}" has been added to ${list.title}`,
      });
    } catch (error) {
      console.error('Error adding track:', error);
      toast({
        title: 'Error',
        description: 'Failed to add track. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetAndClose = () => {
    setSelectedList(null);
    setAnnotation('');
    setAddedToLists(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
          <DialogDescription>
            Choose a list to add "{track.title}" by {track.artist}
          </DialogDescription>
        </DialogHeader>

        {/* Track preview */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          {track.artworkUrl ? (
            <img 
              src={track.artworkUrl} 
              alt={track.title}
              className="w-12 h-12 rounded object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{track.title}</p>
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
          </div>
        </div>

        {/* Annotation input */}
        <div className="space-y-2">
          <Label htmlFor="annotation">Curator Note (optional)</Label>
          <Textarea
            id="annotation"
            placeholder="e.g., 'Skip to 1:30 for the drop' or 'Perfect for late night coding'"
            value={annotation}
            onChange={(e) => setAnnotation(e.target.value)}
            rows={2}
            maxLength={280}
          />
        </div>

        {/* List selection */}
        <div className="space-y-2">
          <Label>Select a List</Label>
          
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (!myLists || myLists.length === 0) && (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground text-sm mb-3">
                  You haven't created any lists yet
                </p>
                <Link to="/create" onClick={() => onOpenChange(false)}>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First List
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!isLoading && myLists && myLists.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {myLists.map((list) => {
                const isAdded = addedToLists.has(list.id);
                
                return (
                  <button
                    key={list.id}
                    onClick={() => !isAdded && handleAddToList(list)}
                    disabled={isPending || isAdded}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                      isAdded 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'hover:bg-muted/50 hover:border-violet-200'
                    )}
                  >
                    {/* List thumbnail */}
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      {list.image ? (
                        <img src={list.image} alt={list.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                          <Music className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* List info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{list.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {list.tags.length > 0 ? list.tags.slice(0, 2).join(', ') : 'No tags'}
                      </p>
                    </div>

                    {/* Status */}
                    {isAdded ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check className="w-4 h-4" />
                        Added
                      </div>
                    ) : isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={resetAndClose}>
            {addedToLists.size > 0 ? 'Done' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
