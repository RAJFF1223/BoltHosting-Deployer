#!/bin/bash

PINK='\033[38;5;205m'
PURPLE='\033[38;5;99m'
CYAN='\033[036m'
GREEN='\033[032m'
RED='\033[031m'
NC='\033[0m'

echo -e "${PINK}💖 ==================================================== 💖${NC}"
echo -e "${PURPLE}🔮       BoltHosting Deployer Bot - Intelligent Start     🔮${NC}"
echo -e "${PINK}💖 ==================================================== 💖${NC}"

# Auto-install dependencies if missing
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${PURPLE}🐳 Installing Docker Engine...${NC}"
    sudo apt update && sudo apt install -y docker.io
    sudo systemctl start docker && sudo systemctl enable docker
fi

if ! command -v node >/dev/null 2>&1; then
    echo -e "${PURPLE}🟢 Installing Node.js ecosystem...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
    sudo npm install -g pm2
fi

# AUTOMATED ENVIRONMENT GENERATION LAYER
if [ ! -f .env ]; then
    echo -e "\n${CYAN}✨ Configuration file (.env) missing! Let's build it instantly...${NC}"
    read -p "👉 Paste your Discord Bot Token: " user_token
    read -p "👉 Paste your Bot Application Client ID: " user_client
    read -p "👉 Paste your Discord Server (Guild) ID: " user_guild
    
    cat <<EOF > .env
DISCORD_TOKEN=$user_token
CLIENT_ID=$user_client
GUILD_ID=$user_guild
OWNER_NAME="Lights.in"
EOF
    echo -e "${GREEN}✅ .env file automatically generated and optimized!${NC}"
fi

# Build Sandbox Template
echo -e "\n${CYAN}📦 Building template Docker container image...${NC}"
sudo docker build -t bolthosting-vps:latest .

# Install node dependencies cleanly
echo -e "\n${CYAN}📁 Updating core project packages...${NC}"
npm install

# Force-Restart background instances cleanly
echo -e "\n${CYAN}⚡ Initializing runtime daemon process links via PM2...${NC}"
pm2 delete "bolthosting-bot" >/dev/null 2>&1
pm2 start index.js --name "bolthosting-bot"
pm2 save

echo -e "\n${PINK}💖 ==================================================== 💖${NC}"
echo -e "${GREEN}✨ Setup completed! Check your bot status via: pm2 logs${NC}"
echo -e "${PINK}💖 ==================================================== 💖${NC}"
