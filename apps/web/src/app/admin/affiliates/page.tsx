'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShoppingBag, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AffiliateLink {
  _id: string;
  topic: string;
  url: string;
  title: string;
  clicks: number;
}

export default function AdminAffiliates() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Form state
  const [newLink, setNewLink] = useState({
    topic: '',
    url: '',
    title: '',
  });

  const fetchLinks = async () => {
     try {
       // Since we don't have a secure GET all links yet, we'll just show what's added or mock some
       // In production, this would be a protected GET /api/admin/affiliates
       setLoading(false);
     } catch (err) {
       setLoading(false);
     }
  };

  const handleAuthorize = () => {
    if (password === 'chatly-admin-2026') {
      setIsAuthorized(true);
      fetchLinks();
    } else {
      toast.error('Invalid admin password');
    }
  };

  const addLink = async () => {
    if (!newLink.topic || !newLink.url || !newLink.title) {
       return toast.error('Please fill all fields');
    }

    try {
      // For MVP, we use the model's structure. In a real app, this would be a protected endpoint.
      // Since it's mongo, we'll just demonstrate the call structure
       toast.success('Affiliate link saved (Demo Mode)');
       setLinks([...links, { ...newLink, _id: Date.now().toString(), clicks: 0 }]);
       setNewLink({ topic: '', url: '', title: '' });
    } catch (err) {
       toast.error('Failed to save link');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Admin Portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuthorize()}
            />
            <Button className="w-full" onClick={handleAuthorize}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Affiliate Manager</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add New Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
              placeholder="Topic (e.g. tech)" 
              value={newLink.topic}
              onChange={(e) => setNewLink({...newLink, topic: e.target.value})}
            />
            <Input 
              placeholder="Title" 
              value={newLink.title}
              onChange={(e) => setNewLink({...newLink, title: e.target.value})}
            />
            <Input 
              placeholder="Affiliate URL" 
              value={newLink.url}
              onChange={(e) => setNewLink({...newLink, url: e.target.value})}
            />
          </div>
          <Button onClick={addLink} className="w-full">Save Link</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.length === 0 && (
          <p className="text-muted-foreground text-center col-span-2 py-12">No links found. Add your first affiliate link above.</p>
        )}
        {links.map((link) => (
          <Card key={link._id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{link.topic}</Badge>
                  <span className="text-sm font-semibold">{link.title}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</p>
                <p className="text-[10px] font-bold uppercase tracking-tighter text-primary">{link.clicks} Clicks</p>
              </div>
              <Button variant="destructive" size="icon" className="shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
