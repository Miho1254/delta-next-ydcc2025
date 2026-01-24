#!/bin/bash

# Deploy Script for Agri-Loop Backend
# Usage: bash <(curl -s https://raw.githubusercontent.com/Miho1254/delta-next-ydcc2025/master/backend/deploy/deploy.sh)

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Agri-Loop Backend...${NC}"

# Variables
APP_ROOT="/var/www/agri-loop"
BACKEND_DIR="$APP_ROOT/backend"
REPO_URL="https://github.com/Miho1254/delta-next-ydcc2025.git"

# 1. Check Pre-requisites
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found.${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠️ Git not found. Installing...${NC}"
    sudo apt-get update && sudo apt-get install -y git
fi

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️ PM2 not found. Installing global pm2...${NC}"
    sudo npm install -g pm2
fi

# 2. Setup Directory
if [ ! -d "$APP_ROOT" ]; then
    echo -e "${YELLOW}📁 Creating directory $APP_ROOT...${NC}"
    sudo mkdir -p "$APP_ROOT"
    sudo chown -R $USER:$USER "$APP_ROOT"
    git clone "$REPO_URL" "$APP_ROOT"
else
    echo -e "${GREEN}📂 Directory exists. Pulling latest code...${NC}"
    cd "$APP_ROOT"
    git reset --hard
    git pull origin master
fi

cd "$BACKEND_DIR"

# 3. Setup Environment
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ .env file not found!${NC}"
    echo -e "${YELLOW}Creating .env from example... PLEASE EDIT IT!${NC}"
    cp .env.example .env
    
    # Prompt to edit
    echo -e "${GREEN}📝 Opening .env for editing in 5 seconds... (Press Ctrl+C to skip if you want to edit later)${NC}"
    sleep 5
    if command -v nano &> /dev/null; then
        nano .env
    else
        vi .env
    fi
fi

# 4. Install & Build
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

echo -e "${GREEN}🔧 Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}🏗️ Building application...${NC}"
npm run build

# 5. Start/Restart PM2
echo -e "${GREEN}🔄 Managing PM2 process...${NC}"
if pm2 describe agri-loop-api > /dev/null; then
    pm2 reload agri-loop-api
else
    pm2 start ecosystem.config.js
fi

pm2 save

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "📊 Status: ${YELLOW}pm2 status${NC}"
echo -e "📜 Logs: ${YELLOW}pm2 logs agri-loop-api${NC}"

