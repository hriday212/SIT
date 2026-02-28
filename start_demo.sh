#!/bin/bash
echo "==========================================="
echo "Starting AgriTracker Blockchain Demo"
echo "==========================================="
echo ""

# Ensure Node is in the path for this bash session
export PATH="/c/Program Files/nodejs:$PATH"

echo "[1/2] Starting Local Hardhat Blockchain Node in the background..."
cd Hriday
npx hardhat node > hardhat_node.log 2>&1 &
NODE_PID=$!
echo "Node started with PID: $NODE_PID. Logs in Hriday/hardhat_node.log"

sleep 3

echo=""
echo "[2/2] Starting Next.js Frontend..."
cd situs-frontend
npm run dev

# When the user stops the frontend (Ctrl+C), kill the background node too
kill $NODE_PID
