# NexaMeet Signaling Server

This is the signaling server for NexaMeet, a WebRTC-based video conferencing application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory with the following variables:
```env
PORT=3000
CLIENT_URL=http://localhost:5173
```

3. Start the development server:
```bash
npm run dev
```

Or build and start the production server:
```bash
npm run build
npm start
```

## Environment Variables

- `PORT`: The port number the server will listen on (default: 3000)
- `CLIENT_URL`: The URL of the client application (default: http://localhost:5173)

## Features

- WebSocket-based signaling server for WebRTC peer connections
- Room management for video conferences
- Real-time participant tracking
- Automatic cleanup of empty rooms
- Error handling and logging
- CORS support for development and production

## Development

The server is built with:
- TypeScript
- Express.js
- Socket.IO
- CORS middleware
- dotenv for environment variables

## Error Handling

The server includes comprehensive error handling for:
- Connection errors
- Room management errors
- WebRTC signaling errors
- Socket.IO errors

All errors are logged to the console for debugging purposes. 