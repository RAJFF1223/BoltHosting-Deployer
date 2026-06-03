#!/bin/bash

# Vibrant Aesthetic Terminal Colors
PINK='\033[38;5;205m'
PURPLE='\033[38;5;99m'
CYAN='\033[036m'
GREEN='\033[032m'
RED='\033[031m'
NC='\033[0m' # No Color

echo -e "${PINK}💖 ==================================================== 💖${NC}"
echo -e "${PURPLE}🔮        BoltHosting Deployer Bot - Startup System       🔮${NC}"
echo -e "${PINK}💖 ==================================================== 💖${NC}"

# Function to check if a command exists
exists() {
  command -v "$1" >/dev/null 2>&1
}

# 1. Dependency Checks & Autoinstall
echo -e "\n${CYAN}⚙️ [1/4] Verifying core system dependencies...${NC}"

if ! exists docker; then
    echo -e "${PURPLE}🐳 Docker not found. Installing Docker Engine cleanly...${NC}"
    sudo apt update && sudo apt install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
else
    echo -e "${GREEN}✅ Docker Engine is already active.${NC}"
fi

if ! exists node; then
    echo -e "${PURPLE}🟢 Node.js not found. Installing Node.js ecosystem...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}✅ Node.js is already active ($(node -v)).${NC}"
fi

if ! exists pm2; then
    echo -e "${PURPLE}🚀 PM2 process manager not found. Installing globally...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}✅ PM2 process manager is already active.${NC}"
fi

# 2. Check for Configuration File
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file is missing!${NC}"
    echo -e "${CYAN}Please create a .env file with your variables before running this script.${NC}"
    exit 1
fi

# 3. Build the CodeSandbox Docker Template
echo -e "\n${CYAN}📦 [2/4] Building BoltHosting VPS Docker template image...${NC}"
sudo docker build -t bolthosting-vps:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image 'bolthosting-vps:latest' compiled successfully.${NC}"
else
    echo -e "${RED}❌ Critical Error: Failed to build Docker image.${NC}"
    exit 1
fi

# 4. Install Node Dependencies
echo -e "\n${CYAN}📁 [3/4] Fetching required project modules...${NC}"
npm install

# 5. Launch Application Core with PM2
echo -e "\n${CYAN}⚡ [4/4] Activating Discord bot process manager loops...${NC}"
pm2 delete "bolthosting-bot" >/dev/null 2>&1  # Clear previous instances if they exist
pm2 start index.js --name "bolthosting-bot"
pm2 save

echo -e "\n${PINK}💖 ==================================================== 💖${NC}"
echo -e "${GREEN}✨ BoltHosting Deployer Bot is now 100% ONLINE & RUNNING! ✨${NC}"
echo -e "${PURPLE}🔮 Enjoy your seamless CodeSandbox-style VPS creation!   🔮${NC}"
echo -e "${PINK}💖 ==================================================== 💖${NC}"
