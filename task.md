# Chatly MVP — Task Checklist

## Phase 1 — Foundation (Day 1–8) 🔴
- [x] P1-01 Monorepo boilerplate — Next.js + Node + Socket.io + MongoDB + Redis
- [x] P1-02 Anonymous session — UUID in localStorage, no login/email
- [/] P1-03 Matchmaking queue — Redis queue, topic-first pairing with any-topic fallback
- [x] P1-04 Real-time chat room — Socket.io rooms, typing indicator, disconnect on tab close
- [x] P1-05 Topic room selector — Pre-chat screen with topic tags
- [x] P1-06 Skip limiter — 10 skips/hour, visible meter, cooldown timer
- [x] P1-07 Icebreaker card — Random prompt shown to both users, chat unlocks after 20s
- [x] P1-08 Post-chat feedback — Good / Boring / Creepy buttons → MongoDB karma collection

## Phase 2 — Earn Layer (Day 9–16) 🔴
- [x] P2-01 Google AdSense banner — Sidebar desktop, sticky-bottom mobile
- [x] P2-02 Rewarded ad → skip refill — Watch 15s ad, get +3 skips
- [x] P2-03 Post-chat affiliate card — Topic-contextual affiliate links after every chat
- [x] P2-04 Affiliate link admin panel — Map topic → affiliate URL without redeploy
- [x] P2-05 Sponsored room slot — Branded room (flat monthly fee, hardcoded initially)
- [x] P2-06 UTM + click tracker — Log affiliate clicks + ad impressions to MongoDB, CSV export

## Phase 3 — Retention (Day 17–22) 🟡
- [ ] P3-01 Karma score engine — Formula: (duration×1) + (Good×3) - (Creepy×10)
- [ ] P3-02 Karma-based matching — High karma → high karma pool
- [ ] P3-03 Daily streak badge — "3 good chats today 🔥" UI badge, no backend cost
- [ ] P3-04 Referral link — Invite friend → skip cooldown lifted for 1 hour, UUID param tracking
- [ ] P3-05 Creep filter — Block ASL/sexual keywords in first 30s, tooltip warning, flag account

## Phase 4 — Admin & Safety (Day 23–27) 🟡
- [ ] P4-01 Admin dashboard — DAU, skip rate, top topics, affiliate CTR, karma distribution
- [ ] P4-02 Shadowban system — 3 reports = shadowban, longer queue, auto-expire 48h
- [ ] P4-03 Ad revenue tracker — AdSense API daily ₹ vs DAU ratio

## Phase 5 — Launch (Day 28–30) 🔴
- [ ] P5-01 Deploy — Vercel (Next.js) + Railway (Node/Socket.io) + Atlas M0
- [ ] P5-02 PWA setup — Installable, push notification "A match is waiting for you 👋"
- [ ] P5-03 SEO landing page — Target "anonymous chat India", "talk to strangers online India"
