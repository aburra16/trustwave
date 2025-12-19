/**
 * Onboarding flow for new users - "Genesis Bootstrap"
 * Shows starter packs of curators by genre
 */

import { useState } from 'react';
import { Check, Users, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQueryClient } from '@tanstack/react-query';
import { mockStarterPacks } from '@/lib/mockMusicData';
import { cn } from '@/lib/utils';

export function OnboardingFlow() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useCurrentUser();
  const { mutateAsync: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async () => {
    if (selectedGenres.length === 0) {
      toast({
        title: 'Select at least one genre',
        description: 'Choose the music you\'re interested in to get started.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Collect all curators from selected genres
      const curatorsToFollow = new Set<string>();
      for (const genre of selectedGenres) {
        const pack = mockStarterPacks.find(p => p.genre === genre);
        if (pack) {
          pack.curators.forEach(c => curatorsToFollow.add(c));
        }
      }

      // Create a kind 3 event (follow list)
      const pTags = Array.from(curatorsToFollow).map(pubkey => ['p', pubkey]);
      
      await createEvent({
        kind: 3,
        content: '',
        tags: pTags,
      });

      toast({
        title: 'Welcome to TrustWave!',
        description: `You're now following ${curatorsToFollow.size} curators. Your feed is ready!`,
      });

      // Invalidate WoT query to refresh
      queryClient.invalidateQueries({ queryKey: ['wot'] });
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      queryClient.invalidateQueries({ queryKey: ['trusted-list-items'] });
    } catch (error) {
      console.error('Error creating follow list:', error);
      toast({
        title: 'Error',
        description: 'Failed to set up your follows. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 dark:from-violet-950/20 dark:to-fuchsia-950/20">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Welcome to TrustWave!</CardTitle>
        <CardDescription className="text-base">
          To see music, you need to trust some curators. Select the genres you're interested in, 
          and we'll connect you with top curators in those areas.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Genre selection */}
        <div className="grid sm:grid-cols-2 gap-3">
          {mockStarterPacks.map((pack) => (
            <button
              key={pack.genre}
              onClick={() => toggleGenre(pack.genre)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]',
                selectedGenres.includes(pack.genre)
                  ? 'border-violet-500 bg-violet-100 dark:bg-violet-900/30'
                  : 'border-muted hover:border-violet-300'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{pack.displayName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{pack.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{pack.curators.length} curators</span>
                  </div>
                </div>
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                  selectedGenres.includes(pack.genre)
                    ? 'bg-violet-500 text-white'
                    : 'bg-muted'
                )}>
                  {selectedGenres.includes(pack.genre) && (
                    <Check className="w-4 h-4" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Submit button */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={selectedGenres.length === 0 || isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Start Discovering
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          
          {selectedGenres.length > 0 && (
            <p className="text-sm text-muted-foreground">
              You'll follow{' '}
              <span className="font-medium text-foreground">
                {mockStarterPacks
                  .filter(p => selectedGenres.includes(p.genre))
                  .reduce((acc, p) => acc + p.curators.length, 0)}
              </span>{' '}
              curators
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
