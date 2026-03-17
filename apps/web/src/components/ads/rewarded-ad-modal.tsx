'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { trackProfitability } from '@/lib/analytics';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  uuid: string;
  onSuccess: (newCount: number) => void;
}

export function RewardedAdModal({ isOpen, onClose, uuid, onSuccess }: RewardedAdModalProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isFinished, setIsFinished] = useState(false);

  const startAd = () => {
    setIsWatching(true);
    // In a real Google H5 setup, you'd call a google-provided function here
    // adConfig({
    //   adType: 'rewarded',
    //   onAdComplete: () => handleReward(),
    // });
    
    trackProfitability.rewardedAdStart('skips_refill');
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleReward();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReward = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL ? process.env.NEXT_PUBLIC_SOCKET_URL.replace('socket.io', '') : 'http://localhost:4000'}/api/skips/refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid }),
      });
      
      const data = await res.json();
      if (data.success) {
        setIsFinished(true);
        onSuccess(data.skipCount);
        trackProfitability.rewardedAdComplete('skips_refill');
        toast.success('Reward granted: +3 Skips matched!');
      }
    } catch (err) {
      toast.error('Failed to refill skips.');
      setIsWatching(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsWatching(false);
      setTimeLeft(15);
      setIsFinished(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Out of Skips?</DialogTitle>
          <DialogDescription>
            Watch a short video to unlock 3 more skips immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 gap-4">
          {!isWatching && !isFinished && (
            <div className="bg-primary/10 p-6 rounded-full">
              <Play className="w-12 h-12 text-primary" />
            </div>
          )}
          
          {isWatching && !isFinished && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-xl font-bold">{timeLeft}s remaining</p>
              <p className="text-sm text-muted-foreground">Keep this modal open to earn reward</p>
            </div>
          )}

          {isFinished && (
            <div className="flex flex-col items-center gap-2 text-green-500">
              <CheckCircle2 className="w-16 h-16" />
              <p className="text-lg font-semibold">Reward Unlocked!</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          {!isWatching && !isFinished && (
            <Button onClick={startAd} className="w-full gap-2">
              <Play className="w-4 h-4" /> Watch for 3 Skips
            </Button>
          )}
          {isFinished && (
            <Button onClick={onClose} className="w-full" variant="outline">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
