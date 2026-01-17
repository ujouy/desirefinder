#!/bin/bash

# Quick deployment script for DigitalOcean Droplet
# Run this after provisioning your droplet and cloning the repository

set -e

echo "🚀 DesireFinder Deployment Script"
echo "================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    apt-get update
    apt-get install docker-compose-plugin -y
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found!"
    echo "📝 Creating from example..."
    cp .env.production.example .env.production
    echo "✏️  Please edit .env.production with your API keys before continuing"
    echo "   Run: nano .env.production"
    exit 1
fi

# Check if nginx config exists
if [ ! -f nginx/conf.d/app.conf ]; then
    echo "⚠️  Nginx config not found!"
    echo "Please ensure nginx/conf.d/app.conf exists"
    exit 1
fi

echo "🔨 Building and starting services..."
docker compose up -d --build

echo "⏳ Waiting for services to start..."
sleep 10

echo "🗄️  Running database migrations..."
docker compose exec -T app yarn db:generate
docker compose exec -T app yarn db:deploy

echo "✅ Deployment complete!"
echo ""
echo "📊 Check service status:"
docker compose ps

echo ""
echo "📋 View logs:"
echo "   docker compose logs -f app"

echo ""
echo "🌐 Next steps:"
echo "   1. Configure SSL certificate (see DIGITALOCEAN_DROPLET_DEPLOYMENT.md)"
echo "   2. Update nginx/conf.d/app.conf with your domain"
echo "   3. Test your application at http://YOUR_DROPLET_IP"
