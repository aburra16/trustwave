/**
 * Library page - User's lists and activity
 */

import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Music, Plus, User, Clock, Library as LibraryIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout';
import { ListCard } from '@/components/ListCard';
import { useMusicListsByAuthor } from '@/hooks/useMusicLists';
import { useListItemsByAuthor } from '@/hooks/useListItems';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function Library() {
  useSeoMeta({
    title: 'Library - TrustWave',
    description: 'Your music lists and activity.',
  });

  const { user } = useCurrentUser();
  const { data: myLists, isLoading: listsLoading } = useMusicListsByAuthor(user?.pubkey);
  const { data: myItems, isLoading: itemsLoading } = useListItemsByAuthor(user?.pubkey);

  if (!user) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                <LibraryIcon className="w-10 h-10 text-violet-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your Library</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Sign in to see your playlists and track your curation activity.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Library</h1>
            <p className="text-muted-foreground">
              Manage your playlists and see your curation activity
            </p>
          </div>
          <Link to="/create">
            <Button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
              <Plus className="w-4 h-4 mr-2" />
              New List
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="lists" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lists" className="gap-2">
              <Music className="w-4 h-4" />
              My Lists ({myLists?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Clock className="w-4 h-4" />
              My Activity ({myItems?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* My Lists */}
          <TabsContent value="lists">
            {listsLoading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!listsLoading && (!myLists || myLists.length === 0) && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No lists yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                    Create your first playlist to start curating music for your network.
                  </p>
                  <Link to="/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First List
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {!listsLoading && myLists && myLists.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myLists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Activity */}
          <TabsContent value="activity">
            {itemsLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-12 h-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!itemsLoading && (!myItems || myItems.length === 0) && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No activity yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                    Start adding tracks to playlists to see your curation activity here.
                  </p>
                  <Link to="/search-tracks">
                    <Button variant="outline">
                      Find Tracks to Add
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {!itemsLoading && myItems && myItems.length > 0 && (
              <div className="space-y-2">
                {myItems.map((item) => (
                  <Card key={item.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                          <Music className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{item.artist}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.createdAt * 1000).toLocaleDateString()}
                        </div>
                      </div>
                      {item.annotation && (
                        <p className="mt-2 text-sm italic text-muted-foreground pl-16">
                          "{item.annotation}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
