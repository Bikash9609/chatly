'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/components/providers/socket-provider';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { sendGTMEvent } from '@next/third-parties/google';

const TOPICS = [
  { id: 'movies', label: '🎬 Movies & TV' },
  { id: 'tech', label: '💻 Tech & Gaming' },
  { id: 'life', label: '🌱 Life Advice' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'vent', label: '🤬 Venting' },
];

export default function TopicSelector() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { socket, isConnected, lastMatch, setLastMatch } = useSocket();
  const router = useRouter();

  // Listen for the match via global state
  useEffect(() => {
    if (lastMatch) {
      sendGTMEvent({ event: 'match_found', topic: lastMatch.topic });
      router.push(`/room/${lastMatch.roomId}`);
    }
  }, [lastMatch, router]);

  const handleStartMatchmaking = () => {
    if (!socket || !isConnected) return;
    
    // Clear previous match to avoid stale redirects
    setLastMatch(null);

    // Default to 'any' if nothing selected
    const topic = selectedTopic || 'any';
    
    setIsSearching(true);
    sendGTMEvent({ event: 'matchmaking_start', topic });

    socket.emit('join_queue', { topic });
  };

  const handleCancel = () => {
    if (!socket) return;
    socket.emit('leave_queue');
    socket.off('matched'); // Remove the listener
    setIsSearching(false);
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {!isSearching ? (
          <motion.div 
            key="selector"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full space-y-8 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">What's on your mind?</h2>
              <p className="text-muted-foreground">Pick a topic to find a better match, or just skip to talk about anything.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {TOPICS.map((t) => (
                <Badge
                  key={t.id}
                  variant={selectedTopic === t.id ? 'default' : 'secondary'}
                  className={`text-sm py-2 px-4 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                    selectedTopic === t.id ? 'shadow-md shadow-primary/20' : ''
                  }`}
                  onClick={() => {
                    setSelectedTopic(selectedTopic === t.id ? null : t.id);
                    if (selectedTopic !== t.id) {
                      sendGTMEvent({ event: 'topic_selected', topic: t.id });
                    }
                  }}
                >
                  {t.label}
                </Badge>
              ))}
            </div>

            <div className="pt-8">
              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-semibold rounded-xl"
                disabled={!isConnected}
                onClick={handleStartMatchmaking}
              >
                {!isConnected ? 'Connecting...' : selectedTopic ? 'Find Match' : 'Talk with Anyone'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center space-y-6 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
              <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Looking for a partner...</h3>
              <p className="text-muted-foreground animate-pulse">
                {selectedTopic ? `Searching in ${TOPICS.find(t=>t.id===selectedTopic)?.label}` : 'Searching anyone online'}
              </p>
            </div>

            <Button variant="ghost" onClick={handleCancel} className="mt-8">
              Cancel Search
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
