#!/bin/bash

# Kill any existing processes
echo "Stopping any existing servers..."
pkill -f "ts-node" || true
pkill -f "vite" || true

# Install dependencies if needed
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd server && npm install && cd ..
fi

# Start the backend server
echo "Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "Backend server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Backend server failed to start!"
        kill $BACKEND_PID
        exit 1
    fi
    echo "Waiting for backend server... ($i/30)"
    sleep 1
done

# Start the frontend server
echo "Starting frontend server..."
cd ..
npm run dev &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Set up trap to catch termination signal
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 