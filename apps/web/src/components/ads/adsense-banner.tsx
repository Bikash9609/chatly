'use client';

import { useEffect } from 'react';

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
    } catch (err) {
      console.error('[adsense] Error pushing ad:', err);
    }
  }, []);

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
