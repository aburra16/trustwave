/**
 * Settings page
 */

import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Radio, Server, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Layout } from '@/components/Layout';
import { RelayListManager } from '@/components/RelayListManager';
import { useTheme } from '@/hooks/useTheme';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWebOfTrust } from '@/hooks/useWebOfTrust';

export default function Settings() {
  useSeoMeta({
    title: 'Settings - TrustWave',
    description: 'Manage your TrustWave settings.',
  });

  const { theme, setTheme } = useTheme();
  const { user } = useCurrentUser();
  const { data: wot } = useWebOfTrust();

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your TrustWave preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how TrustWave looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Web of Trust Info */}
          {user && wot && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Web of Trust
                </CardTitle>
                <CardDescription>
                  Your trust network for filtering content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                    <p className="text-2xl font-bold text-violet-600">{wot.depth0.size}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                  <div className="p-4 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-900/20">
                    <p className="text-2xl font-bold text-fuchsia-600">{wot.depth1.size}</p>
                    <p className="text-sm text-muted-foreground">Extended (Depth 1)</p>
                  </div>
                  <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                    <p className="text-2xl font-bold text-pink-600">{wot.all.size}</p>
                    <p className="text-sm text-muted-foreground">Total Network</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Your trust network includes people you follow directly (Depth 0) and people they follow (Depth 1).
                  Content from these users will appear in your "Trusted" feed.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Relay Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Relays
              </CardTitle>
              <CardDescription>
                Manage your Nostr relay connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelayListManager />
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                About TrustWave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                TrustWave is a decentralized music discovery app that replaces opaque algorithms 
                with a transparent Web-of-Trust. Discover music through people you trust, not 
                through ads or paid placements.
              </p>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Built with</span>
                <a 
                  href="https://shakespeare.diy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline"
                >
                  Shakespeare
                </a>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Protocol</span>
                <span>Nostr + Decentralized Lists</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
