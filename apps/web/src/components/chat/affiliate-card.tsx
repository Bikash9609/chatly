'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { sendGTMEvent } from '@next/third-parties/google';

interface AffiliateLink {
  _id: string;
  topic: string;
  url: string;
  title: string;
  imageUrl?: string;
}

interface AffiliateCardProps {
  topic: string;
  uuid: string;
}

export function AffiliateCard({ topic, uuid }: AffiliateCardProps) {
  const [link, setLink] = useState<AffiliateLink | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL ? process.env.NEXT_PUBLIC_SOCKET_URL.replace('socket.io', '') : 'http://localhost:4000'}/api/affiliates/${topic}`);
        const data = await res.json();
        if (data) setLink(data);
      } catch (err) {
        console.error('[affiliate] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (topic) fetchLink();
  }, [topic]);

  const handleClick = async () => {
    if (!link) return;
    
    sendGTMEvent({ 
      event: 'affiliate_click', 
      topic, 
      linkId: link._id,
      url: link.url 
    });

    try {
      await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL ? process.env.NEXT_PUBLIC_SOCKET_URL.replace('socket.io', '') : 'http://localhost:4000'}/api/affiliates/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: link._id,
          uuid,
          utmSource: 'post-chat-card',
          topic
        }),
      });
      
      // Open link in new tab
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('[affiliate] Click log error:', err);
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading || !link) return null;

  return (
    <Card className="w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {link.imageUrl && (
        <div className="h-32 bg-muted relative">
          <img src={link.imageUrl} alt={link.title} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            Sponsored
          </div>
        </div>
      )}
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          Recommended for you
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-sm font-medium leading-tight">{link.title}</p>
        <Button size="sm" className="w-full gap-2" onClick={handleClick}>
          Check it out <ExternalLink className="w-3 h-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
