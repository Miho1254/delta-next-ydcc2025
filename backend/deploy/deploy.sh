#!/bin/bash

# Deploy Script for Agri-Loop Backend
# Run on VPS: bash deploy.sh

set -e

echo "🚀 Deploying Agri-Loop Backend..."

# Variables
APP_DIR="/var/www/agri-loop/backend"
REPO_URL="https://github.com/Miho1254/delta-next-ydcc2025.git"

# Check if directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "📁 Cloning repository..."
    sudo mkdir -p /var/www/agri-loop
    sudo chown $USER:$USER /var/www/agri-loop
    git clone $REPO_URL /var/www/agri-loop
fi

cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin master

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build Next.js
echo "🏗️ Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart agri-loop-api || pm2 start ecosystem.config.js

echo "✅ Deployment complete!"
echo "📊 Check status: pm2 status"
echo "📜 View logs: pm2 logs agri-loop-api"
