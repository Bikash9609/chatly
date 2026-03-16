## Here is the full structured MVP plan — **profit-first, 30 days, solo MERN dev.**

## Tech Stack (fits your skills perfectly)

| Layer       | Tool                 | Why                                 |
| ----------- | -------------------- | ----------------------------------- |
| Frontend    | Next.js              | SEO-ready, PWA support, fast        |
| Realtime    | Node.js + Socket.io  | Chat rooms, typing, queue           |
| DB          | MongoDB Atlas        | Karma, sessions, topics (free tier) |
| Cache/Queue | Redis (Upstash free) | Matchmaking queue                   |
| Deploy      | Vercel + Railway     | Free initially, scales cheap        |
| Ads         | Google AdSense (web) | Zero payment gateway needed         |
| Affiliates  | Amazon.in + Flipkart | Direct signup, free                 |

---

## Phase 1 — Foundation `Day 1–8` 🔴 Critical

- `P1-01` **Project boilerplate** — Next.js + Node + Socket.io + MongoDB + Redis monorepo setup
- `P1-02` **Anonymous session** — UUID per user in localStorage, zero login, zero email. Temp identity only
- `P1-03` **Matchmaking queue** — Redis queue, pairs by shared topic tag first, then any-topic fallback
- `P1-04` **Real-time chat room** — Socket.io rooms, typing indicator, auto-disconnect on tab close
- `P1-05` **Topic room selector** — Pre-chat screen: pick 1–2 from Movies / Tech / Life / Travel / Vent
- `P1-06` **Skip limiter** — 10 skips/hour, visible meter on screen, cooldown timer
- `P1-07` **Icebreaker card** — Random prompt shown to both users; full chat unlocks after 20s
- `P1-08` **Post-chat feedback** — 3 buttons: Good / Boring / Creepy → writes to MongoDB karma collection

> **Rule:** Don't add any feature not in this list until Phase 2 starts. Ship skeleton fast.

---

## Phase 2 — Earn Layer `Day 9–16` 🔴 Critical (THIS IS THE MONEY)

- `P2-01` **Google AdSense banner** — Sidebar on desktop, sticky bottom on mobile. Between chats = highest CTR. Apply for AdSense immediately on Day 1 (takes ~1 week approval)
- `P2-02` **Rewarded ad → skip refill** ⭐ — "Watch a 15s ad, get +3 skips." AdMob rewarded unit. This is the **core earn loop** — users voluntarily watch ads to solve their skip problem
- `P2-03` **Post-chat affiliate card** ⭐ — After every chat, show a contextual card based on topic:
  - Movies room → Prime Video / Hotstar affiliate
  - Tech room → Amazon.in gadget deals
  - Travel room → Booking.com / MakeMyTrip
  - Life/Vent room → Books on Audible
- `P2-04` **Affiliate link admin panel** — Simple page: map topic → affiliate URL. Add/edit without code deploy
- `P2-05` **Sponsored room slot** — 1 special branded room (e.g., "Jio Night Talks"). Sold as flat monthly fee. Hardcoded HTML initially, no system needed
- `P2-06` **UTM + click tracker** — Log every affiliate click + ad impression to MongoDB. Export CSV from admin

> **Earn logic:** User can't escape the earn loop. To chat more → watch ad → you earn. To not watch → they wait. Either way you profit.

---

## Phase 3 — Retention `Day 17–22` 🟡 High

- `P3-01` **Karma score engine** — Score = (chat duration × 1) + (Good rating × 3) - (Creepy report × 10)
- `P3-02` **Karma-based matching** — High karma → matched with high karma. Low karma → slower queue, worse pool
- `P3-03` **Daily streak badge** — "3 good chats today 🔥" badge shown on screen. Zero backend cost, pure psychology
- `P3-04` **Referral link** — After good chat: "Invite a friend → skip cooldown lifted for 1 hour." Track via UUID param
- `P3-05` **Creep filter** — Block "m/f", "asl", "horny" etc in first 30s → show tooltip warning, mark account

---

## Phase 4 — Admin & Safety `Day 23–27` 🟡 High

- `P4-01` **Admin dashboard** — DAU, skip rate, top topics, affiliate CTR, karma distribution. Next.js + MongoDB Aggregation
- `P4-02` **Shadowban system** — 3 reports = shadowban (longer queue, lower priority). Auto-expires in 48h for minor, permanent for repeat offenders
- `P4-03` **Ad revenue tracker** — AdSense API → daily ₹ earned vs DAU ratio. Shows you cost-per-user vs earn-per-user

---

## Phase 5 — Launch `Day 28–30` 🔴 Critical

- `P5-01` **Deploy** — Next.js on Vercel (free). Node+Socket.io on Railway ($5/mo after free tier). Atlas M0 free
- `P5-02` **PWA setup** — Installable on Android/iOS without App Store. Push notification: "A match is waiting for you 👋"
- `P5-03` **SEO landing page** — Target: "anonymous chat India", "talk to strangers online India". Organic Google traffic = free users

---

## Earn Timeline Projection

| DAU    | AdSense (est.) | Affiliate (est.) | Sponsor (flat) | Total/month |
| ------ | -------------- | ---------------- | -------------- | ----------- |
| 500    | ₹800           | ₹500             | —              | ~₹1,300     |
| 2,000  | ₹3,500         | ₹2,000           | ₹5,000         | ~₹10,500    |
| 10,000 | ₹18,000        | ₹10,000          | ₹15,000        | ~₹43,000    |
| 50,000 | ₹90,000        | ₹50,000          | ₹50,000        | ~₹1.9L      |

---

## What to Skip in MVP (scope lock)

- ❌ No video/voice (adds infra cost, safety complexity)
- ❌ No login/profiles (kills anonymity, adds friction)
- ❌ No payment gateway (as agreed)
- ❌ No mobile app (PWA is enough to start)
- ❌ No AI moderation (manual shadowban is fine initially)

Start AdSense application on **Day 1 itself** — approval takes 7–10 days and you want it live when you launch. Want me to also generate the MongoDB schema and Socket.io room architecture for this?
