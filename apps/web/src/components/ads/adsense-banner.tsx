'use client';

import { useEffect } from 'react';
import { trackProfitability } from '@/lib/analytics';

interface AdSenseBannerProps {
  slot: string;
  format?: 'auto' | 'fluid';
  responsive?: 'true' | 'false';
  style?: React.CSSProperties;
}

export function AdSenseBanner({ slot, format = 'auto', responsive = 'true', style }: AdSenseBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      
      // Log impression
      const uuid = localStorage.getItem('chatly_uuid');
      if (uuid) {
        fetch('/api/tracking/impression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid, type: 'adsense', entityId: slot }),
        }).catch(() => {});
      }
      
      trackProfitability.adImpression(slot, 'adsense');
    } catch (err) {
      console.error('[adsense] Error pushing ad:', err);
    }
  }, [slot]);

  return (
    <div className="w-full flex justify-center py-4">
      <ins
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
