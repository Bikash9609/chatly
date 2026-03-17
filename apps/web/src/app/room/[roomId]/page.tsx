'use client';

import { useEffect, useState, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/providers/socket-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut, Clock, SkipForward } from 'lucide-react';
import { trackEngagement, trackEvent } from '@/lib/analytics';
import { SkipMeter } from '@/components/chat/skip-meter';
import { FeedbackModal } from '@/components/chat/feedback-modal';
import { useSession } from '@/components/providers/session-provider';
import { RewardedAdModal } from '@/components/ads/rewarded-ad-modal';
import { toast } from 'sonner';
import { Logo } from '@/components/ui/logo';
import { filterContent } from '@/lib/filters';
import { AdSenseBanner } from '@/components/ads/adsense-banner';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'partner' | 'system';
  timestamp: Date;
}

export default function ChatRoom({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();
  const { socket, isConnected, lastMatch, setLastMatch } = useSocket();
  
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
  const hasInitialized = useRef(false);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, partnerTyping]);

  const handleMatched = useCallback((data: { icebreakerPrompt: string; roomId: string; topic?: string }) => {
    console.log('[chat] Matched data:', data);
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    setIcebreaker(data.icebreakerPrompt);
    setActiveRoomId(data.roomId);
    setCurrentTopic(data.topic || '');
    trackEngagement.chatStart(data.topic || '');
    trackEvent('icebreaker_shown', { category: 'engagement' });
    
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
  }, []); // hasInitialized.current handles the "once" logic

  // 1. Initialize match from global state (handles redirect from TopicSelector)
  useEffect(() => {
    if (lastMatch && lastMatch.roomId === roomId && !hasInitialized.current) {
      // Use setTimeout to avoid synchronous setState in effect (React warning)
      const timer = setTimeout(() => {
        handleMatched(lastMatch!);
        setLastMatch(null); 
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [lastMatch, roomId, setLastMatch, handleMatched]);

  // 2. Handle socket events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handlePartnerMessage = (text: string) => {
      const filtered = filterContent(text);
      setMessages((prev) => [...prev, { 
        id: Math.random().toString(), 
        text: filtered, 
        sender: 'partner',
        timestamp: new Date()
      }]);
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
        { 
          id: Math.random().toString(), 
          text: `Partner left (${reason}). Chat ended.`, 
          sender: 'system',
          timestamp: new Date()
        }
      ]);
      setChatLocked(true);
      trackEvent('chat_ended', { category: 'engagement', reason });
      setShowFeedback(true);
    };

    const handleSkipDenied = (data: { cooldownSeconds: number }) => {
      setCooldownSeconds(data.cooldownSeconds);
      setShowRewardedAd(true);
      trackEvent('skip_limit_hit', { category: 'engagement' });
    };

    const handleSkipAccepted = (data: { skipCount: number }) => {
      updateSessionInfo({ skipCount: data.skipCount });
      router.push('/chat');
    };

    socket.on('partner_message', handlePartnerMessage);
    socket.on('partner_typing', handlePartnerTyping);
    socket.on('partner_left', handlePartnerLeft);
    socket.on('matched', handleMatched); // Also handle mid-chat rematches if they happen
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
  }, [socket, isConnected, router, roomId, handleMatched, updateSessionInfo]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || chatLocked || !socket) return;

    const filtered = filterContent(inputText.trim());
    socket.emit('send_message', filtered);
    setMessages((prev) => [...prev, { 
      id: Math.random().toString(), 
      text: filtered, 
      sender: 'me',
      timestamp: new Date()
    }]);
    setInputText('');
    trackEngagement.messageSent();
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (socket && !chatLocked) socket.emit('typing');
  };

  const handleSkip = () => {
      if (!socket) return;
      trackEngagement.chatSkip();
      socket.emit('skip');
      // Wait for skip_accepted or skip_denied before routing back
    };
  
    const handleLeave = () => {
      if (!socket) return;
      socket.emit('leave_queue'); // safety
      router.push('/');
    };

  return (
    <main className="flex flex-col h-dvh max-w-3xl mx-auto bg-background/50 relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleLeave} className="rounded-full">
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Logo className="scale-90 origin-left" />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <SkipMeter skipCount={skipCount} cooldownSeconds={cooldownSeconds} />
          </div>
          <Button variant="secondary" onClick={handleSkip} className="gap-2 shrink-0 rounded-full h-10 px-6 font-semibold border-2 border-primary/10 hover:border-primary/30 transition-all">
            <SkipForward className="w-4 h-4" /> Skip
          </Button>
        </div>
      </header>

      {/* Mobile Skip Meter (visible only on small screens below header) */}
      <div className="sm:hidden px-4 py-2 border-b bg-background/50 flex justify-center shrink-0">
        <SkipMeter skipCount={skipCount} cooldownSeconds={cooldownSeconds} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'me' ? 'self-end items-end' : 
                  msg.sender === 'system' ? 'self-center items-center' : 'self-start items-start'
                }`}
              >
                {msg.sender === 'system' ? (
                  <span className="text-[10px] uppercase tracking-widest font-bold bg-muted text-muted-foreground px-3 py-1 rounded-full my-4">
                    {msg.text}
                  </span>
                ) : (
                  <div className="relative group">
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        msg.sender === 'me'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                    </div>
                    <span className={`text-[9px] mt-1 block opacity-30 group-hover:opacity-80 transition-opacity text-muted-foreground font-medium ${
                      msg.sender === 'me' ? 'text-right' : 'text-left'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {partnerTyping && (
              <div className="self-start text-xs text-muted-foreground animate-pulse px-4 py-2 bg-muted/30 rounded-full flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Partner is typing
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <footer className="p-4 border-t bg-background/80 backdrop-blur-md shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2 relative max-w-2xl mx-auto">
          <Input
            value={inputText}
            onChange={handleTyping}
            placeholder={chatLocked ? `Wait for countdown (${countdown}s)...` : 'Type a message...'}
            disabled={chatLocked}
            className="rounded-full h-14 px-6 pr-16 bg-muted/50 border-none focus-visible:ring-primary/50 text-base"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputText.trim() || chatLocked}
            className="absolute right-1.5 top-1.5 h-11 w-11 rounded-full shadow-lg shadow-primary/20 transition-transform active:scale-90"
          >
            <Send className="w-5 h-5" />
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
            className="absolute inset-x-4 bottom-24 z-20 pointer-events-none flex justify-center"
          >
            <Card className="p-6 max-w-sm w-full bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10">
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-2 text-primary font-bold mb-2 uppercase tracking-tighter text-sm">
                  <Clock className="w-4 h-4 animate-spin-slow" /> Unlocks in {countdown}s
                </div>
                <h3 className="text-lg font-bold leading-tight">Icebreaker Prompt</h3>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  &ldquo;{icebreaker}&rdquo;
                </p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 pt-2">Think of your answer</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => {
          setShowFeedback(false);
          router.push('/chat'); // Auto-requeue after feedback
        }}
        roomId={activeRoomId || roomId}
        uuid={uuid || ''}
        topic={currentTopic}
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

      {/* Sidebar Ad (Desktop Only) */}
      <aside className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 w-[160px]">
        <AdSenseBanner slot="room-sidebar-left" format="fluid" responsive="false" style={{ display: 'block', width: '160px', height: '600px' }} />
      </aside>
      <aside className="hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 w-[160px]">
        <AdSenseBanner slot="room-sidebar-right" format="fluid" responsive="false" style={{ display: 'block', width: '160px', height: '600px' }} />
      </aside>

    </main>
  );
}
