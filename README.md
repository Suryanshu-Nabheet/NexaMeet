# NexaMeet

A modern, feature-rich video conferencing application built with React, TypeScript, and WebRTC.

## Features

- 🎥 Real-time video conferencing
- 💬 Chat functionality
- 📱 Screen sharing
- 👥 Participant management
- 🎨 Excalidraw integration for collaborative whiteboarding
- 💻 Code editor with Monaco Editor
- 🤖 AI-powered features
- ⏺️ Meeting recording
- 📝 Transcription services
- 🎯 Waiting room functionality
- 🌐 Responsive design

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Socket.io Client
- WebRTC
- Monaco Editor
- Excalidraw
- TensorFlow.js

### Backend
- Node.js
- Express
- TypeScript
- Socket.io
- WebSocket
- UUID

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Suryanshu-Nabheet/NexaMeet.git
cd NexaMeet
```

### 2. Install dependencies

This project requires two sets of dependencies - one for the frontend and one for the backend server.

#### Install frontend dependencies

```bash
npm install
```

#### Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 3. Configure environment variables (if needed)

Create environment files if your application requires specific configuration:

```bash
# Frontend .env
cp .env.example .env

# Backend .env
cd server
cp .env.example .env
cd ..
```

## Running the Project

### Quick Start (Automated)

Use the provided startup script that handles both frontend and backend:

```bash
chmod +x start.sh
./start.sh
```

This will:
- Install dependencies if needed
- Start the backend server on port 3001
- Start the frontend development server on port 5173

### Manual Start

#### Start Backend Server

In one terminal:

```bash
cd server
npm run dev
```

The backend server will start on `http://localhost:3001`

#### Start Frontend Server

In another terminal:

```bash
npm run dev
```

The frontend server will start on `http://localhost:5173`

### Development Commands

#### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Start with server
npm run dev:server
```

#### Backend

```bash
# Start development server (from server directory)
cd server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
NexaMeet/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── meeting/       # Meeting-related components
│   │   └── ui/            # UI components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and service files
│   └── types/             # TypeScript type definitions
├── server/                # Backend server
│   ├── src/              # Server source code
│   └── dist/             # Compiled server code
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## Important Notes

- There are **two separate `node_modules`** folders:
  - One in the root directory (frontend dependencies)
  - One in the `server/` directory (backend dependencies)
- Both need to be installed for the application to work properly
- The backend server runs on port **3001**
- The frontend development server runs on port **5173**
- Ensure both servers are running for full functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Suryanshu Nabheet

## Repository

GitHub: https://github.com/Suryanshu-Nabheet/NexaMeet.git
