# Chatly Web 🌐

The frontend for Chatly, built with Next.js and Tailwind CSS.

## 🚀 Key Features
- **Anonymous Sessions**: Automatic UUID generation and state persistence.
- **Matchmaking UI**: Topic selection and real-time pairing status.
- **Chat Experience**: Real-time messaging with typing indicators.
- **Profit-Ready**: Slot for Google AdSense and affiliate cards.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Real-time**: Socket.io Client

## 🚦 Getting Started

### Installation
Run from the root or inside this directory:
```bash
yarn install
```

### Environment Variables
Create a `.env` file based on `.env.example`:
```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Development
```bash
yarn dev
```

## 📂 Structure
- `src/app`: Routes and Page components.
- `src/components`: Reusable UI components.
- `src/hooks`: Custom React hooks (socket lifecycle, sessions).
- `src/assets`: Static images and icons.

