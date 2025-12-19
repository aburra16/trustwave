/**
 * Create new list page - Curator tool
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { ArrowLeft, Music, Loader2, X, Plus, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { useCreateList } from '@/hooks/useCreateList';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';

const suggestedTags = ['bitcoin', 'electronic', 'chill', 'rock', 'hip-hop', 'jazz', 'ambient', 'indie', 'v4v', 'focus'];

export default function CreateList() {
  useSeoMeta({
    title: 'Create List - TrustWave',
    description: 'Create a new curated music playlist.',
  });

  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { mutateAsync: createList, isPending } = useCreateList();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a name for your playlist.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const event = await createList({
        title: title.trim(),
        description: description.trim(),
        image: image.trim() || undefined,
        tags,
      });

      toast({
        title: 'List created!',
        description: 'Your playlist has been created successfully.',
      });

      // Navigate to the new list
      navigate(`/list/${event.id}`);
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: 'Error',
        description: 'Failed to create playlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-8 max-w-2xl">
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Sign in to create lists</h2>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to create and curate playlists.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              Create New List
            </CardTitle>
            <CardDescription>
              Create a playlist that anyone can contribute to. Your list will be discoverable by other users.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Name *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Bitcoin Beats, Chill V4V, Late Night Coding"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What kind of music will this list feature?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Cover image */}
              <div className="space-y-2">
                <Label htmlFor="image">Cover Image URL</Label>
                <div className="flex gap-3">
                  <Input
                    id="image"
                    type="url"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1"
                  />
                  {image && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste a URL to an image for your playlist cover
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Genre Tags</Label>
                
                {/* Current tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add new tag */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(newTag);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => handleAddTag(newTag)}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Suggested tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {suggestedTags
                    .filter(t => !tags.includes(t))
                    .slice(0, 6)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/30"
                        onClick={() => handleAddTag(tag)}
                      >
                        + {tag}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isPending || !title.trim()}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4 mr-2" />
                      Create List
                    </>
                  )}
                </Button>
                <Link to="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
