# Chatly Server ⚙️

The backend for Chatly, built with Node.js, Express, and Socket.io.

## 🚀 Key Features
- **Matchmaking Engine**: Redis-backed queue for pairing users by topic.
- **Real-time Communication**: Low-latency chat via Socket.io.
- **Karma System**: MongoDB-backed scoring for user quality.
- **Anonymous Sessions**: Temporary identity management without auth.

## 🛠 Tech Stack
- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: MongoDB (Mongoose)
- **Cache**: Redis (ioredis)

## 🚦 Getting Started

### Installation
Run from the root or inside this directory:
```bash
yarn install
```

### Environment Variables
Create a `.env` file based on `.env.example`:
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/chatly
REDIS_URL=redis://localhost:6379
```

### Development
```bash
yarn dev
```

## 📂 Structure
- `src/index.ts`: Entry point and server setup.
- `src/socket/`: Socket.io handlers and matchmaking logic.
- `src/models/`: Mongoose schemas for Karma and Logs.
- `src/routes/`: REST API endpoints for analytics and admin.
