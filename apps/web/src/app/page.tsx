"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {trackEvent} from "@/lib/analytics";
import Image from "next/image";
import {AdSenseBanner} from "@/components/ads/adsense-banner";
import heroImage from "@/assets/63586825_speech_bubble_chat_talk_communication_icon_3d_background_illustration.png";

import { Logo } from "@/components/ui/logo";

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/50 overflow-hidden relative">
      <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
        <Logo />
      </div>

      <div className="max-w-3xl text-center space-y-8 relative pt-20">
        <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-4 animate-float">
          <Image
            src={heroImage}
            alt="Chatly Hero"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Chatly
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
            Talk to strangers anonymously. No signup. No profiles. Just real
            conversations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/chat">
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-semibold rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
              onClick={() =>
                trackEvent("cta_click", {
                  category: "engagement",
                  label: "start_chatting",
                })
              }>
              Start Chatting Now
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left pb-24 md:pb-0">
          <div className="space-y-2 group">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">🔒 100% Anonymous</h3>
            <p className="text-muted-foreground text-sm">
              We don&apos;t ask for your name, email, or phone number. Your
              identity is always hidden.
            </p>
          </div>
          <div className="space-y-2 group">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">⚡ Instant Matching</h3>
            <p className="text-muted-foreground text-sm">
              Pick a topic you care about and get matched with someone in
              seconds.
            </p>
          </div>
          <div className="space-y-2 group">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">💬 Deep Conversations</h3>
            <p className="text-muted-foreground text-sm">
              Every chat starts with an icebreaker prompt to skip the small
              talk.
            </p>
          </div>
        </div>
      </div>

      {/* AdSense Placement */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-sm border-t">
        <AdSenseBanner
          slot="landing-bottom-mobile"
          format="auto"
          responsive="true"
        />
      </div>

      <aside className="hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 w-[160px]">
        <AdSenseBanner
          slot="landing-sidebar-desktop"
          format="fluid"
          responsive="false"
          style={{display: "block", width: "160px", height: "600px"}}
        />
      </aside>
    </main>
  );
}
