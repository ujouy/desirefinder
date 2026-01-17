#!/bin/bash

# SSL/HTTPS Setup Script for DesireFinder
# This script sets up Nginx reverse proxy and SSL certificates

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔒 DesireFinder SSL/HTTPS Setup"
echo "================================"
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

# Step 2: Install Nginx
echo -e "${BLUE}Step 2: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    echo -e "${GREEN}✅ Nginx installed${NC}"
else
    echo -e "${GREEN}✅ Nginx already installed${NC}"
fi
echo ""

# Step 3: Install Certbot
echo -e "${BLUE}Step 3: Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✅ Certbot installed${NC}"
else
    echo -e "${GREEN}✅ Certbot already installed${NC}"
fi
echo ""

# Step 4: Configure Nginx
echo -e "${BLUE}Step 4: Configuring Nginx...${NC}"

# Create Nginx config
cat > /etc/nginx/sites-available/desirefinder <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
if [ ! -L /etc/nginx/sites-enabled/desirefinder ]; then
    ln -s /etc/nginx/sites-available/desirefinder /etc/nginx/sites-enabled/
fi

# Remove default site if it exists
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
echo -e "${BLUE}Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration valid${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi
echo ""

# Step 5: Check if DNS is pointing to this server
echo -e "${BLUE}Step 5: Verifying DNS...${NC}"
SERVER_IP=$(curl -s ifconfig.me)
echo "This server's IP: $SERVER_IP"

# Get domain IP
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
        echo "SSL certificate may fail. Continue anyway?"
        read -p "(y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi
echo ""

# Step 6: Get SSL Certificate
echo -e "${BLUE}Step 6: Getting SSL certificate from Let's Encrypt...${NC}"
echo -e "${YELLOW}This will prompt you for email and agreement${NC}"
echo ""

# Run certbot
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate installed!${NC}"
else
    echo -e "${RED}❌ SSL certificate installation failed${NC}"
    echo "You may need to:"
    echo "  1. Wait for DNS to propagate"
    echo "  2. Ensure port 80 is open"
    echo "  3. Run manually: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
    exit 1
fi
echo ""

# Step 7: Verify SSL
echo -e "${BLUE}Step 7: Verifying SSL setup...${NC}"
sleep 2

# Test HTTPS
if curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN} | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ HTTPS is working!${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS test failed (may need a few minutes to propagate)${NC}"
fi
echo ""

# Step 8: Setup auto-renewal
echo -e "${BLUE}Step 8: Setting up certificate auto-renewal...${NC}"
# Certbot automatically sets up renewal, but let's verify
if systemctl list-timers | grep -q certbot; then
    echo -e "${GREEN}✅ Auto-renewal already configured${NC}"
else
    # Test renewal
    certbot renew --dry-run
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Auto-renewal test successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Auto-renewal test failed (check logs)${NC}"
    fi
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
echo "  4. Check certificate status:"
echo "     sudo certbot certificates"
echo ""
