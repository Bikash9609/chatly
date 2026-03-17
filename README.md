# Chatly 💬

**Chatly** is a profit-first, anonymous chat application designed for rapid engagement and monetization. Built as a solo MERN stack monorepo, it focuses on real-time interactions, anonymous sessions, and a built-in earn loop via ads and affiliate integrations.

---

## 🎬 Demos

| User Chat Experience        | Admin Dashboard               |
| --------------------------- | ----------------------------- |
| ![Chat Demo](./demo/chat.mov) | ![Admin Demo](./demo/admin.mov) |

---

## 🚀 Vision

The goal is to provide a seamless "talk to strangers" experience with a focus on:

- **Zero Friction**: No login, no email, just click and chat.
- **Monetization First**: Integrated Google AdSense and affiliate cards.
- **Quality Matching**: Karma-based matchmaking and topic-based rooms.
- **PWA Ready**: Mobile-first design that can be installed on any device.

---

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS + Lucide React icons
- **State Management**: React Hooks + LocalStorage for anonymous sessions
- **Real-time**: Socket.io Client

### Backend

- **Runtime**: [Node.js](https://nodejs.org/) with TypeScript
- **Framework**: [Express.js](https://expressjs.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Mongoose)
- **Caching/Queue**: [Redis](https://redis.io/) (for matchmaking)

### Infrastructure

- **Package Manager**: [Yarn v4 (Berry)](https://yarnpkg.com/)
- **Containerization**: Docker & Docker Compose
- **Deployment**: Vercel (Frontend) & Railway (Backend)

---

## 📂 Project Structure

```text
chatly/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── server/       # Node.js + Express + Socket.io backend
├── docker-compose.dev.yml   # Docker setup for local development
├── package.json      # Root package.json (monorepo configuration)
└── PLAN.md           # Detailed 30-day roadmap and feature list
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js (v20+)
- [Yarn v4](https://yarnpkg.com/getting-started/install)
- Docker (optional, for Redis/MongoDB)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd chatly
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Setup Environment Variables:
   - Create `.env` files in `apps/web` and `apps/server` based on `.env.example`.

### Running Locally

You can run both the frontend and backend concurrently:

```bash
yarn dev
```

Alternatively, run them separately:

- **Web**: `yarn workspace @chatly/web dev`
- **Server**: `yarn workspace @chatly/server dev`

---

## 🗺 Roadmap

The detailed development phases are outlined in [PLAN.md](./PLAN.md).

- **Phase 1**: Foundation (Matchmaking, Real-time chat, Anonymous sessions) - _In Progress_
- **Phase 2**: Earn Layer (AdSense, Affiliate cards, Rewarded ads)
- **Phase 3**: Retention (Karma score, Streak badges, Referral system)
- **Phase 4**: Admin & Safety (Dashboard, Shadowban system)
- **Phase 5**: Launch (Deployment, PWA setup, SEO)

---

## 📝 License

This project is open-source and free to use under the [MIT License](LICENSE).
