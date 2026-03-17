'use client';

import { sendGAEvent } from '@next/third-parties/google';

type ActionCategory = 'engagement' | 'profitability' | 'retention' | 'safety';

interface EventParams {
  category: ActionCategory;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Tracks a custom event in Google Analytics 4
 * @param action The name of the action (e.g., 'affiliate_click', 'message_sent')
 * @param params Additional parameters for the event
 */
export function trackEvent(action: string, params: EventParams) {
  if (typeof window === 'undefined') return;

  try {
    sendGAEvent({
      event: action,
      ...params,
    });
    
    // Optional: Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${action}:`, params);
    }
  } catch (error) {
    console.error('[Analytics] Failed to send event:', error);
  }
}

/**
 * Predefined patterns for profitability tracking
 */
export const trackProfitability = {
  affiliateClick: (topic: string, linkId: string, url: string) => 
    trackEvent('affiliate_click', { category: 'profitability', topic, linkId, url }),
    
  adImpression: (slot: string, type: string) =>
    trackEvent('ad_impression', { category: 'profitability', slot, type }),
    
  rewardedAdStart: (type: string) =>
    trackEvent('rewarded_ad_start', { category: 'profitability', type }),
    
  rewardedAdComplete: (type: string) =>
    trackEvent('rewarded_ad_complete', { category: 'profitability', type }),
};

/**
 * Predefined patterns for engagement tracking
 */
export const trackEngagement = {
  chatStart: (topic: string) => 
    trackEvent('chat_start', { category: 'engagement', topic }),
    
  messageSent: () => 
    trackEvent('message_sent', { category: 'engagement' }),
    
  chatSkip: () => 
    trackEvent('chat_skip', { category: 'engagement' }),
    
  feedbackSubmitted: (rating: string) => 
    trackEvent('feedback_submitted', { category: 'engagement', rating }),
};
