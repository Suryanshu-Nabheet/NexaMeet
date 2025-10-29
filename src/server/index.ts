import express from 'express';
import { createServer } from 'http';
import { SignalingServer } from './signaling';
import path from 'path';

const app = express();
const server = createServer(app);

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../dist')));

// Initialize signaling server
const signalingServer = new SignalingServer(server);

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 