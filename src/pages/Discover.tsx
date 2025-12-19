/**
 * Discover page - Browse and search music lists
 */

import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Search, Hash, TrendingUp, Clock, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { ListCard } from '@/components/ListCard';
import { useMusicLists, useSearchMusicLists, useMusicListsByTag } from '@/hooks/useMusicLists';

const popularTags = ['bitcoin', 'electronic', 'chill', 'rock', 'hip-hop', 'jazz', 'ambient', 'indie'];

export default function Discover() {
  useSeoMeta({
    title: 'Discover - TrustWave',
    description: 'Browse and discover curated music playlists.',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: allLists, isLoading: allLoading } = useMusicLists(50);
  const { data: searchResults, isLoading: searchLoading } = useSearchMusicLists(searchQuery);
  const { data: tagResults, isLoading: tagLoading } = useMusicListsByTag(selectedTag || undefined);

  // Determine which results to show
  const isSearching = searchQuery.trim().length > 0;
  const isFiltering = selectedTag !== null;
  
  const lists = isSearching 
    ? searchResults 
    : isFiltering 
      ? tagResults 
      : allLists;
  
  const isLoading = isSearching ? searchLoading : isFiltering ? tagLoading : allLoading;

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover</h1>
          <p className="text-muted-foreground">
            Browse curated playlists from the community
          </p>
        </div>

        {/* Search and filters */}
        <div className="space-y-4 mb-8">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedTag(null);
              }}
              className="pl-10"
            />
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                onClick={() => handleTagClick(tag)}
              >
                <Hash className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* Active filter indicator */}
          {(isSearching || isFiltering) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {isSearching 
                  ? `Showing results for "${searchQuery}"` 
                  : `Filtered by #${selectedTag}`}
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i}>
                <Skeleton className="aspect-square" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!lists || lists.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No lists found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {isSearching 
                  ? `No lists match "${searchQuery}". Try a different search term.`
                  : isFiltering
                    ? `No lists tagged with #${selectedTag} yet.`
                    : 'No lists have been created yet. Be the first to create one!'}
              </p>
              {(isSearching || isFiltering) && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  View All Lists
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lists grid */}
        {!isLoading && lists && lists.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
