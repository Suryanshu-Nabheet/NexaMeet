# 🚀 NexaMeet - Video Conferencing Platform

<div align="center">

![NexaMeet](https://img.shields.io/badge/NexaMeet-Video%20Conferencing-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18-blue)
![WebRTC](https://img.shields.io/badge/WebRTC-Production-green)
![License](https://img.shields.io/badge/License-MIT-green)

**Enterprise-grade video conferencing built with WebRTC, inspired by Jitsi Meet architecture**

[Features](#-features) • [Quick Start](#-quick-start) • [Production Deployment](#-production-deployment) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎥 Core Features
- 🎬 **Real-time Video Conferencing** - High-quality peer-to-peer video calls
- 💬 **Chat Functionality** - Real-time messaging during meetings
- 📱 **Screen Sharing** - Share your screen with participants
- 👥 **Participant Management** - Mute, remove, and manage participants
- 🎨 **Collaborative Whiteboarding** - Excalidraw integration
- 💻 **Code Editor** - Monaco Editor for collaborative coding
- ⏺️ **Meeting Recording** - Record meetings locally
- 📝 **Transcription Services** - AI-powered transcription
- 🎯 **Waiting Room** - Control meeting access
- 🌐 **Responsive Design** - Works on all devices

### 🚀 Production-Ready Features
- 📊 **Connection Quality Monitoring** - Real-time metrics (latency, packet loss, bandwidth)
- 🎛️ **Adaptive Bitrate Control** - Automatically adjusts quality based on connection
- 🔄 **Auto-Reconnection** - Smart reconnection with exponential backoff
- 🔒 **Security** - Rate limiting, input validation, IP blocking
- 📈 **Monitoring & Analytics** - Health checks, metrics, error tracking
- 🐳 **Docker Support** - Complete containerization for easy deployment
- 🌍 **Multi-TURN Support** - Twilio, Metered, and custom TURN servers
- ⚡ **Performance Optimized** - Efficient resource management

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Frontend (React + TypeScript)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ WebRTC       │  │ Quality      │  │ Adaptive     │  │
│  │ Service      │  │ Monitor      │  │ Bitrate      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Socket.IO / WebSocket
                          │
┌─────────────────────────────────────────────────────────┐
│         Backend Server (Node.js + Express)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Signaling    │  │ Monitoring   │  │ Security     │  │
│  │ Server       │  │ Service      │  │ Service      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ WebRTC (STUN/TURN)
                          │
┌─────────────────────────────────────────────────────────┐
│              TURN/STUN Servers                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Twilio TURN  │  │ Metered TURN │  │ Custom TURN  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Socket.io Client** - Real-time communication
- **WebRTC** - Video/audio streaming
- **Monaco Editor** - Code editing
- **Excalidraw** - Whiteboarding
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Socket.io** - WebSocket server
- **UUID** - ID generation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Redis** - Session management (optional)
- **PostgreSQL** - Database (optional)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm
- **Docker** & Docker Compose (for production)
- **TURN Server** credentials (Twilio/Metered/Custom)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/Suryanshu-Nabheet/NexaMeet.git
cd NexaMeet
```

#### 2. Install dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

#### 3. Configure environment variables

Create `.env` file in the root directory:

```bash
# Server Configuration
VITE_SERVER_URL=http://localhost:3001
NODE_ENV=development
PORT=3001

# TURN Server (Required for production)
# Option 1: Twilio (Recommended)
VITE_TWILIO_ACCOUNT_SID=your-account-sid
VITE_TWILIO_AUTH_TOKEN=your-auth-token

# Option 2: Metered TURN (Free tier available)
VITE_METERED_API_KEY=your-api-key

# Option 3: Custom TURN Server
VITE_TURN_SERVER_URL=turn:your-server.com:3478
VITE_TURN_USERNAME=username
VITE_TURN_PASSWORD=password

# Security (Optional)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

#### 4. Start the application

**Option A: Quick Start (Automated)**

```bash
chmod +x start.sh
./start.sh
```

**Option B: Manual Start**

```bash
# Terminal 1 - Backend Server
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production Build

```bash
# Build production image
docker build -t nexameet:latest .

# Run container
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  --name nexameet \
  nexameet:latest
```

### Docker Compose Services

- **app** - NexaMeet application
- **redis** - Session management and caching
- **postgres** - Database (optional)
- **turn** - TURN server (coturn)
- **nginx** - Reverse proxy (optional)

---

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "metrics": {
    "connections": 10,
    "activeMeetings": 3,
    "totalParticipants": 10,
    "averageLatency": 45,
    "errorRate": 0.5
  }
}
```

### Metrics Endpoint

```bash
curl http://localhost:3001/metrics
```

### Connection Quality Monitoring

The platform automatically monitors:
- **Latency** (ms)
- **Packet Loss** (%)
- **Bandwidth** (kbps)
- **Jitter** (ms)
- **Quality Score** (0-100)

Quality levels: `excellent` → `good` → `fair` → `poor` → `very-poor`

---

## 🔒 Security Features

- ✅ **Rate Limiting** - Configurable request limits per IP
- ✅ **Input Validation** - Sanitization and format validation
- ✅ **IP Blocking** - Automatic blocking of abusive IPs
- ✅ **Secure WebRTC** - DTLS-SRTP encryption
- ✅ **CORS Protection** - Configurable CORS policies
- ✅ **Error Tracking** - Comprehensive error logging

---

## 📁 Project Structure

```
NexaMeet/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── auth/               # Authentication
│   │   ├── meeting/            # Meeting components
│   │   └── ui/                 # UI components
│   ├── config/                 # Configuration files
│   │   └── webrtc.config.ts   # WebRTC configuration
│   ├── context/                # React context
│   ├── hooks/                  # Custom hooks
│   ├── pages/                  # Page components
│   ├── services/               # Services
│   │   ├── webrtc.ts          # Base WebRTC service
│   │   ├── webrtcEnhanced.ts  # Enhanced service
│   │   └── connectionQuality.ts # Quality monitoring
│   └── types/                  # TypeScript types
├── server/                      # Backend server
│   ├── src/
│   │   ├── index.ts           # Main server file
│   │   ├── monitoring.ts      # Monitoring service
│   │   └── security.ts        # Security service
│   └── dist/                   # Compiled code
├── public/                      # Static assets
├── Dockerfile                   # Production Docker image
├── docker-compose.yml          # Docker Compose config
└── package.json                # Dependencies
```

---

## 🎯 Development Commands

### Frontend

```bash
# Development server
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

### Backend

```bash
# Development server (from server directory)
cd server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## ☁️ Production Deployment

### Cloud Platforms

#### AWS (ECS/EKS)

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t nexameet .
docker tag nexameet:latest <account>.dkr.ecr.us-east-1.amazonaws.com/nexameet:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/nexameet:latest
```

#### Google Cloud (Cloud Run)

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/nexameet
gcloud run deploy nexameet \
  --image gcr.io/PROJECT_ID/nexameet \
  --platform managed \
  --region us-central1
```

#### Azure (Container Instances)

```bash
az container create \
  --resource-group nexameet-rg \
  --name nexameet \
  --image nexameet:latest \
  --dns-name-label nexameet \
  --ports 3001
```

---

## 🔧 Configuration

### TURN Server Setup

**Why TURN servers?** They're essential for WebRTC to work behind firewalls and NATs.

#### Option 1: Twilio (Recommended for Production)

1. Sign up at [Twilio](https://www.twilio.com)
2. Get Account SID and Auth Token
3. Add to `.env`:
   ```bash
   VITE_TWILIO_ACCOUNT_SID=your-sid
   VITE_TWILIO_AUTH_TOKEN=your-token
   ```

#### Option 2: Metered (Free Tier Available)

1. Sign up at [Metered](https://www.metered.ca)
2. Get API key
3. Add to `.env`:
   ```bash
   VITE_METERED_API_KEY=your-api-key
   ```

#### Option 3: Self-Hosted (coturn)

Included in `docker-compose.yml`. Configure in `.env`:
```bash
TURN_USERNAME=nexameet
TURN_PASSWORD=your-password
```

---

## 📈 Scaling Strategy

### Horizontal Scaling

1. **Load Balancer** - Use sticky sessions for Socket.IO
2. **Redis** - Session management and clustering
3. **Multiple TURN Servers** - Geographic distribution
4. **Database** - Read replicas for read-heavy workloads

### Vertical Scaling

- Optimize Docker resources
- Configure connection limits
- Monitor resource usage

---

## 🧪 Testing

```bash
# Unit tests (when implemented)
npm test

# Integration tests
npm run test:integration

# Load testing
npm run test:load
```

---

## 🆘 Troubleshooting

### Common Issues

**WebRTC connections failing:**
- ✅ Verify TURN server configuration
- ✅ Check firewall rules
- ✅ Review browser console for errors
- ✅ Test with different browsers

**High latency:**
- ✅ Use geographically close TURN servers
- ✅ Check network conditions
- ✅ Adjust quality settings (automatic)

**Rate limiting:**
- ✅ Review rate limit settings in `.env`
- ✅ Check for DDoS attacks
- ✅ Unblock legitimate IPs via security service

**Server not starting:**
- ✅ Check if port 3001 is available
- ✅ Verify all dependencies are installed
- ✅ Check server logs for errors

---

## 📚 Documentation

- **API Documentation** - Coming soon
- **Architecture Details** - See Architecture section above
- **Configuration Guide** - See Configuration section

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Suryanshu Nabheet**

- GitHub: [@Suryanshu-Nabheet](https://github.com/Suryanshu-Nabheet)
- Repository: [NexaMeet](https://github.com/Suryanshu-Nabheet/NexaMeet)

---

## 🎉 Roadmap

- [ ] SFU (Selective Forwarding Unit) implementation
- [ ] Cloud recording service
- [ ] AI transcription service
- [ ] AI features (background blur, noise cancellation)
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] White-label solution
- [ ] API for third-party integrations

---

## 💡 Tips for Production

1. **Always use TURN servers** - Essential for reliable connections
2. **Monitor connection quality** - Use built-in metrics
3. **Set up alerts** - For error rates and performance
4. **Regular updates** - Keep dependencies updated
5. **Backup strategy** - Regular backups of configuration
6. **SSL certificates** - Use HTTPS in production
7. **CDN** - For static assets
8. **Load testing** - Before going live

---

<div align="center">

**Built with ❤️ for scalable video conferencing**

⭐ Star this repo if you find it helpful!

</div>
