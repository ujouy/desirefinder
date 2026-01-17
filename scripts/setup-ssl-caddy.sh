#!/bin/bash

# SSL/HTTPS Setup Script for DesireFinder using Caddy
# Caddy automatically handles SSL certificates

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔒 DesireFinder SSL/HTTPS Setup (Caddy)"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Get domain name
read -p "Enter your domain name [desirefinder.com]: " DOMAIN
DOMAIN=${DOMAIN:-desirefinder.com}

echo ""
echo -e "${BLUE}Setting up SSL for: $DOMAIN${NC}"
echo ""

# Step 1: Update system
echo -e "${BLUE}Step 1: Updating system...${NC}"
apt update -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# Step 2: Install Caddy
echo -e "${BLUE}Step 2: Installing Caddy...${NC}"
if ! command -v caddy &> /dev/null; then
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update
    apt install caddy -y
    echo -e "${GREEN}✅ Caddy installed${NC}"
else
    echo -e "${GREEN}✅ Caddy already installed${NC}"
fi
echo ""

# Step 3: Configure Caddy
echo -e "${BLUE}Step 3: Configuring Caddy...${NC}"

# Backup existing Caddyfile if it exists
if [ -f /etc/caddy/Caddyfile ]; then
    cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create Caddyfile
cat > /etc/caddy/Caddyfile <<EOF
${DOMAIN}, www.${DOMAIN} {
    reverse_proxy localhost:3000
}
EOF

echo -e "${GREEN}✅ Caddyfile created${NC}"
echo ""

# Step 4: Check DNS
echo -e "${BLUE}Step 4: Verifying DNS...${NC}"
SERVER_IP=$(curl -s ifconfig.me)
echo "This server's IP: $SERVER_IP"

DOMAIN_IP=$(dig +short ${DOMAIN} | tail -n1)
if [ -z "$DOMAIN_IP" ]; then
    echo -e "${YELLOW}⚠️  Could not resolve ${DOMAIN}${NC}"
    echo "Please ensure DNS is configured correctly"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "${DOMAIN} resolves to: $DOMAIN_IP"
    if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
        echo -e "${GREEN}✅ DNS is pointing to this server${NC}"
    else
        echo -e "${YELLOW}⚠️  DNS points to $DOMAIN_IP, but this server is $SERVER_IP${NC}"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi
echo ""

# Step 5: Start Caddy
echo -e "${BLUE}Step 5: Starting Caddy...${NC}"
systemctl enable caddy
systemctl restart caddy

# Wait a moment for Caddy to start
sleep 3

# Check status
if systemctl is-active --quiet caddy; then
    echo -e "${GREEN}✅ Caddy is running${NC}"
else
    echo -e "${RED}❌ Caddy failed to start${NC}"
    echo "Check logs: sudo journalctl -u caddy"
    exit 1
fi
echo ""

# Step 6: Verify SSL
echo -e "${BLUE}Step 6: Verifying SSL setup...${NC}"
echo "Caddy automatically obtains SSL certificates (may take 1-2 minutes)"
echo ""

# Wait a bit for certificate
sleep 10

# Test HTTPS
if curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN} | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ HTTPS is working!${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS test failed (Caddy may still be obtaining certificate)${NC}"
    echo "Check status: sudo journalctl -u caddy -f"
fi
echo ""

# Summary
echo -e "${GREEN}=================================="
echo "✅ SSL Setup Complete!"
echo "==================================${NC}"
echo ""
echo "Your site is now available at:"
echo "  🌐 https://${DOMAIN}"
echo "  🌐 https://www.${DOMAIN}"
echo ""
echo "Caddy automatically:"
echo "  ✅ Obtains SSL certificates"
echo "  ✅ Auto-renews certificates"
echo "  ✅ Handles HTTP → HTTPS redirect"
echo ""
echo "Next Steps:"
echo "  1. Update your .env file:"
echo "     NEXT_PUBLIC_APP_URL=https://${DOMAIN}"
echo ""
echo "  2. Update webhook URLs:"
echo "     Clerk: https://${DOMAIN}/api/webhooks/clerk"
echo "     NowPayments: https://${DOMAIN}/api/webhooks/nowpayments"
echo ""
echo "  3. Test your site:"
echo "     Visit: https://${DOMAIN}"
echo ""
echo "  4. Check Caddy status:"
echo "     sudo systemctl status caddy"
echo "     sudo journalctl -u caddy -f"
echo ""
