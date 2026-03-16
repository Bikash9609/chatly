'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/providers/socket-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut, Clock, SkipForward } from 'lucide-react';
import { sendGTMEvent } from '@next/third-parties/google';
import { SkipMeter } from '@/components/chat/skip-meter';
import { FeedbackModal } from '@/components/chat/feedback-modal';
import { useSession } from '@/components/providers/session-provider';
import { RewardedAdModal } from '@/components/ads/rewarded-ad-modal';
import { AffiliateCard } from '@/components/chat/affiliate-card';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'partner' | 'system';
}

export default function ChatRoom({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(20);
  const [chatLocked, setChatLocked] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  
  const { uuid, skipCount, updateSessionInfo } = useSession();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, partnerTyping]);

  useEffect(() => {
    if (!socket || !isConnected) {
      router.push('/');
      return;
    }

    // Usually we arrive here after 'matched' event in /chat, but if we refresh,
    // we're disconnected from room. For MVP, refresh = lost chat.
    
    // Fallback: request state if needed, or just let them get disconnected
    const handlePartnerMessage = (text: string) => {
      setMessages((prev) => [...prev, { id: Math.random().toString(), text, sender: 'partner' }]);
      setPartnerTyping(false);
    };

    const handlePartnerTyping = () => {
      setPartnerTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
    };

    const handlePartnerLeft = ({ reason }: { reason: string }) => {
      setMessages((prev) => [
        ...prev, 
        { id: Math.random().toString(), text: `Partner left (${reason}). Chat ended.`, sender: 'system' }
      ]);
      setChatLocked(true);
      sendGTMEvent({ event: 'chat_ended', reason });
      setShowFeedback(true);
    };

    // Replay 'matched' if it happens after mount (rare)
    const handleMatched = (data: any) => {
      setIcebreaker(data.icebreakerPrompt);
      setActiveRoomId(data.roomId);
      setCurrentTopic(data.topic || '');
      sendGTMEvent({ event: 'matched', topic: data.topic });
      sendGTMEvent({ event: 'icebreaker_shown' });
      // Start 20s countdown
      setChatLocked(true);
      setCountdown(20);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setChatLocked(false);
            setIcebreaker(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const handleSkipDenied = (data: { cooldownSeconds: number }) => {
      setCooldownSeconds(data.cooldownSeconds);
      setShowRewardedAd(true); // Trigger Earn Loop
      sendGTMEvent({ event: 'skip_limit_hit' });
    };

    const handleSkipAccepted = (data: { skipCount: number }) => {
      updateSessionInfo({ skipCount: data.skipCount });
      router.push('/chat'); // Re-queue safely
    };

    socket.on('partner_message', handlePartnerMessage);
    socket.on('partner_typing', handlePartnerTyping);
    socket.on('partner_left', handlePartnerLeft);
    socket.on('matched', handleMatched);
    socket.on('skip_denied', handleSkipDenied);
    socket.on('skip_accepted', handleSkipAccepted);

    return () => {
      socket.off('partner_message', handlePartnerMessage);
      socket.off('partner_typing', handlePartnerTyping);
      socket.off('partner_left', handlePartnerLeft);
      socket.off('matched', handleMatched);
      socket.off('skip_denied', handleSkipDenied);
      socket.off('skip_accepted', handleSkipAccepted);
    };
  }, [socket, isConnected, router]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || chatLocked || !socket) return;

    socket.emit('send_message', inputText.trim());
    setMessages((prev) => [...prev, { id: Math.random().toString(), text: inputText.trim(), sender: 'me' }]);
    setInputText('');
    sendGTMEvent({ event: 'message_sent' });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (socket && !chatLocked) socket.emit('typing');
  };

  const handleSkip = () => {
      if (!socket) return;
      sendGTMEvent({ event: 'skip_clicked' });
      socket.emit('skip');
      // Wait for skip_accepted or skip_denied before routing back
    };
  
    const handleLeave = () => {
      if (!socket) return;
      socket.emit('leave_queue'); // safety
      router.push('/');
    };

  return (
    <main className="flex flex-col h-screen max-w-3xl mx-auto bg-background/50 relative">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLeave}>
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Anonymous Chat</span>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <SkipMeter skipCount={skipCount} cooldownSeconds={cooldownSeconds} />
          </div>
          <Button variant="secondary" onClick={handleSkip} className="gap-2 shrink-0">
            <SkipForward className="w-4 h-4" /> Skip
          </Button>
        </div>
      </header>

      {/* Mobile Skip Meter (visible only on small screens below header) */}
      <div className="sm:hidden px-4 py-2 border-b bg-background/50 flex justify-center">
        <SkipMeter skipCount={skipCount} cooldownSeconds={cooldownSeconds} />
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'me' ? 'self-end items-end' : 
                msg.sender === 'system' ? 'self-center items-center' : 'self-start items-start'
              }`}
            >
              {msg.sender === 'system' ? (
                <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full my-4">
                  {msg.text}
                </span>
              ) : (
                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          
          {partnerTyping && (
            <div className="self-start text-xs text-muted-foreground animate-pulse px-2 flex items-center gap-1">
              Partner is typing <span className="flex gap-0.5"><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span></span>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <footer className="p-4 border-t bg-background/80 backdrop-blur-md">
        <form onSubmit={sendMessage} className="flex gap-2 relative">
          <Input
            value={inputText}
            onChange={handleTyping}
            placeholder={chatLocked ? 'Wait for countdown to end...' : 'Type a message...'}
            disabled={chatLocked}
            className="rounded-full h-12 px-6 pr-14"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputText.trim() || chatLocked}
            className="absolute right-1 top-1 h-10 w-10 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>

      {/* Icebreaker Overlay */}
      <AnimatePresence>
        {icebreaker && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-x-4 top-24 z-20 pointer-events-none flex justify-center"
          >
            <Card className="p-6 max-w-sm w-full bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10">
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-2 text-primary font-semibold mb-2">
                  <Clock className="w-5 h-5 animate-spin-slow" /> Unlocks in {countdown}s
                </div>
                <h3 className="text-lg font-bold leading-tight">Icebreaker Prompt</h3>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  "{icebreaker}"
                </p>
                <p className="text-xs text-muted-foreground/50 pt-2">Think of your answer. Chat unlocks soon.</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-2rem)] px-4 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-4">
          {showFeedback && currentTopic && uuid && (
             <AffiliateCard topic={currentTopic} uuid={uuid} />
          )}
        </div>
      </div>

      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => {
          setShowFeedback(false);
          router.push('/chat'); // Auto-requeue after feedback
        }}
        roomId={activeRoomId || params.roomId}
        uuid={uuid || ''}
      />

      <RewardedAdModal 
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        uuid={uuid || ''}
        onSuccess={(newCount) => {
           updateSessionInfo({ skipCount: newCount });
           setShowRewardedAd(false);
           setCooldownSeconds(null);
           toast.info('Skips refilled! You can skip now.');
        }}
      />

    </main>
  );
}
