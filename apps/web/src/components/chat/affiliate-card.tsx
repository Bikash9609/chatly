'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { sendGTMEvent } from '@next/third-parties/google';
import Image from 'next/image';

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
    console.log('[affiliate] Fetching link for topic:', topic);
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
    <Card className="w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border-none shadow-none bg-muted/20 rounded-xl">
      {link.imageUrl && (
        <div className="h-48 bg-muted relative">
          <Image src={link.imageUrl} alt={link.title} fill className="object-cover" />
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm">
            Sponsored
          </div>
        </div>
      )}
      <CardHeader className="p-5 pb-2 text-left">
        <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5" />
          Special Offer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-5 text-left">
        <p className="text-lg font-bold leading-tight tracking-tight text-foreground/90">{link.title}</p>
        <Button size="lg" className="w-full gap-2 shadow-xl shadow-primary/20 font-bold rounded-full group" onClick={handleClick}>
          View Details <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
