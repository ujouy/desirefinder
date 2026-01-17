#!/bin/bash

# Complete DigitalOcean Setup Script for DesireFinder
# This script helps you set up droplet, firewall, and DNS

set -e

echo "🚀 DesireFinder DigitalOcean Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo -e "${YELLOW}⚠️  doctl CLI not found${NC}"
    echo "Installing doctl..."
    
    cd ~
    wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
    tar xf doctl-1.104.0-linux-amd64.tar.gz
    sudo mv doctl /usr/local/bin
    rm doctl-1.104.0-linux-amd64.tar.gz
    
    echo -e "${GREEN}✅ doctl installed${NC}"
    echo ""
    echo "Please authenticate:"
    echo "  doctl auth init"
    echo ""
    exit 1
fi

# Check authentication
if ! doctl auth list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated${NC}"
    echo "Please run: doctl auth init"
    exit 1
fi

echo -e "${GREEN}✅ doctl authenticated${NC}"
echo ""

# Get user input
read -p "Enter droplet name [desirefinder-production]: " DROPLET_NAME
DROPLET_NAME=${DROPLET_NAME:-desirefinder-production}

read -p "Enter region [nyc1]: " REGION
REGION=${REGION:-nyc1}

read -p "Enter droplet size [s-4vcpu-8gb] (4 vCPU / 8GB RAM): " SIZE
SIZE=${SIZE:-s-4vcpu-8gb}

read -p "Enter your domain [desirefinder.com]: " DOMAIN
DOMAIN=${DOMAIN:-desirefinder.com}

echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Droplet Name: $DROPLET_NAME"
echo "  Region: $REGION"
echo "  Size: $SIZE"
echo "  Domain: $DOMAIN"
echo ""

read -p "Continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 1: List SSH keys
echo ""
echo -e "${BLUE}Step 1: Checking SSH keys...${NC}"
SSH_KEYS=$(doctl compute ssh-key list --format ID --no-header)
if [ -z "$SSH_KEYS" ]; then
    echo -e "${YELLOW}⚠️  No SSH keys found${NC}"
    echo "Please add an SSH key in DigitalOcean dashboard first"
    exit 1
fi

SSH_KEY_ID=$(echo "$SSH_KEYS" | head -n 1)
echo -e "${GREEN}✅ Using SSH key: $SSH_KEY_ID${NC}"

# Step 2: Create Droplet
echo ""
echo -e "${BLUE}Step 2: Creating droplet...${NC}"
DROPLET_OUTPUT=$(doctl compute droplet create "$DROPLET_NAME" \
    --image ubuntu-22-04-x64 \
    --size "$SIZE" \
    --region "$REGION" \
    --ssh-keys "$SSH_KEY_ID" \
    --wait \
    --format ID,PublicIPv4,Status)

DROPLET_ID=$(echo "$DROPLET_OUTPUT" | awk 'NR==2 {print $1}')
DROPLET_IP=$(echo "$DROPLET_OUTPUT" | awk 'NR==2 {print $2}')

if [ -z "$DROPLET_IP" ]; then
    echo -e "${YELLOW}⚠️  Droplet created but IP not ready yet${NC}"
    echo "Waiting 30 seconds..."
    sleep 30
    DROPLET_IP=$(doctl compute droplet get "$DROPLET_ID" --format PublicIPv4 --no-header)
fi

echo -e "${GREEN}✅ Droplet created!${NC}"
echo "  ID: $DROPLET_ID"
echo "  IP: $DROPLET_IP"
echo ""

# Step 3: Create Firewall
echo -e "${BLUE}Step 3: Creating firewall...${NC}"
FIREWALL_NAME="${DROPLET_NAME}-firewall"

doctl compute firewall create \
    --name "$FIREWALL_NAME" \
    --inbound-rules "protocol:tcp,ports:22,address:0.0.0.0/0" \
    --inbound-rules "protocol:tcp,ports:80,address:0.0.0.0/0" \
    --inbound-rules "protocol:tcp,ports:443,address:0.0.0.0/0" \
    --outbound-rules "protocol:tcp,ports:all,address:0.0.0.0/0" \
    --outbound-rules "protocol:udp,ports:all,address:0.0.0.0/0" \
    --outbound-rules "protocol:icmp,ports:all,address:0.0.0.0/0" \
    --droplet-ids "$DROPLET_ID" \
    --wait

echo -e "${GREEN}✅ Firewall created and attached!${NC}"
echo ""

# Step 4: Setup DNS (if domain exists in DO)
echo -e "${BLUE}Step 4: Setting up DNS...${NC}"
DOMAIN_EXISTS=$(doctl compute domain list --format Name --no-header | grep -x "$DOMAIN" || true)

if [ -z "$DOMAIN_EXISTS" ]; then
    echo -e "${YELLOW}⚠️  Domain not found in DigitalOcean${NC}"
    echo "Please add domain manually:"
    echo "  1. Go to: https://cloud.digitalocean.com/networking/domains"
    echo "  2. Add domain: $DOMAIN"
    echo "  3. Add A record: @ → $DROPLET_IP"
    echo "  4. Add A record: www → $DROPLET_IP"
else
    echo -e "${GREEN}✅ Domain found in DigitalOcean${NC}"
    
    # Add A record for root
    doctl compute domain records create "$DOMAIN" \
        --record-type A \
        --record-name "@" \
        --record-data "$DROPLET_IP" \
        --record-ttl 3600 || echo "A record @ might already exist"
    
    # Add A record for www
    doctl compute domain records create "$DOMAIN" \
        --record-type A \
        --record-name "www" \
        --record-data "$DROPLET_IP" \
        --record-ttl 3600 || echo "A record www might already exist"
    
    echo -e "${GREEN}✅ DNS records added!${NC}"
fi

echo ""
echo -e "${GREEN}=================================="
echo "✅ Setup Complete!"
echo "==================================${NC}"
echo ""
echo "Droplet Details:"
echo "  Name: $DROPLET_NAME"
echo "  ID: $DROPLET_ID"
echo "  IP: $DROPLET_IP"
echo "  Firewall: $FIREWALL_NAME"
echo ""
echo "Next Steps:"
echo "  1. SSH into droplet:"
echo "     ssh root@$DROPLET_IP"
echo ""
echo "  2. Install Docker:"
echo "     curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
echo "     apt install docker-compose-plugin -y"
echo ""
echo "  3. Deploy DesireFinder:"
echo "     git clone <your-repo> desirefinder && cd desirefinder"
echo "     docker compose -f docker-compose.production.yml up -d"
echo ""
echo "  4. Download models:"
echo "     docker exec -it ollama ollama pull dolphin-llama3"
echo "     docker exec -it ollama ollama pull nomic-embed-text"
echo ""
echo "  5. Access app:"
echo "     http://$DROPLET_IP:3000"
echo ""
