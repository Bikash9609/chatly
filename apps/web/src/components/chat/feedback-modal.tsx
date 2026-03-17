'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { sendGTMEvent } from '@next/third-parties/google';
import { AffiliateCard } from './affiliate-card';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  uuid: string;
  topic?: string;
}

export function FeedbackModal({ isOpen, onClose, roomId, uuid, topic }: FeedbackModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleFeedback = async (rating: 'good' | 'boring' | 'creepy') => {
    setSubmitting(true);
    sendGTMEvent({ event: 'feedback_submitted', rating });
    
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, fromUuid: uuid, rating }),
      });
    } catch (err) {
      console.error('Feedback failed', err);
    } finally {
      setSubmitting(false);
      onClose(); // Triggers redirect or UI clear in parent
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg text-center">
        <DialogHeader>
          <DialogTitle className="text-xl">How was your chat?</DialogTitle>
          <DialogDescription>
            Your feedback helps us match you better and keep the community safe.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 pt-6">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500 transition-colors"
            onClick={() => handleFeedback('good')}
            disabled={submitting}
          >
            <span className="text-3xl">🔥</span>
            <span className="font-semibold">Good</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:text-yellow-500 transition-colors"
            onClick={() => handleFeedback('boring')}
            disabled={submitting}
          >
            <span className="text-3xl">😴</span>
            <span className="font-semibold">Boring</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-colors"
            onClick={() => handleFeedback('creepy')}
            disabled={submitting}
          >
            <span className="text-3xl">🚩</span>
            <span className="font-semibold">Creepy</span>
          </Button>
        </div>

        {/* Affiliate Card Injection */}
        {roomId && (
          <div className="pt-6 border-t mt-6 -mx-6">
            <div className="px-6"> 
               <AffiliateCard topic={topic || 'any'} uuid={uuid} />
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
