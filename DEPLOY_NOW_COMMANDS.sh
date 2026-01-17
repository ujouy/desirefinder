#!/bin/bash
# Quick Deploy Commands for DigitalOcean Droplet
# Run these commands after cloning the repository

set -e

echo "🚀 DesireFinder Deployment - Step by Step"
echo "=========================================="
echo ""

cd /root/desirefinder

# Step 1: Create .env.production if it doesn't exist
if [ ! -f .env.production ]; then
    echo "📝 Step 1: Creating .env.production from template..."
    cp env.production.template .env.production
    echo "⚠️  IMPORTANT: Edit .env.production with your API keys:"
    echo "   nano .env.production"
    echo ""
    echo "Press Enter after you've edited .env.production..."
    read
else
    echo "✅ .env.production already exists"
fi

# Step 2: Build and start services
echo ""
echo "🔨 Step 2: Building and starting Docker containers..."
docker compose up -d --build

# Step 3: Wait for services to start
echo ""
echo "⏳ Step 3: Waiting for services to start (30 seconds)..."
sleep 30

# Step 4: Run database migrations
echo ""
echo "🗄️  Step 4: Running database migrations..."
docker compose exec -T app npx prisma generate
docker compose exec -T app npx prisma db push

# Step 5: Check status
echo ""
echo "📊 Step 5: Checking service status..."
docker compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check logs: docker compose logs -f app"
echo "2. Visit your app: http://$(hostname -I | awk '{print $1}')"
echo "3. Test health endpoint: curl http://localhost:3000/api/health"
echo ""
echo "🔒 To setup SSL:"
echo "   See DIGITALOCEAN_DROPLET_DEPLOYMENT.md for SSL setup"
