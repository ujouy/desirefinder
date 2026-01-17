#!/bin/bash

# Deployment script for DesireFinder on DigitalOcean droplet
# Run this on your droplet after uploading files

set -e

echo "🚀 Deploying DesireFinder..."
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.production.yml" ]; then
    echo "❌ Error: docker-compose.production.yml not found"
    echo "Please run this script from /root/desirefinder"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating .env template..."
    cat > .env <<'EOF'
# Database (Supabase)
DATABASE_URL=postgresql://postgres.wtpqkxpyjzfrrvyvvbmc:lS2xp8wirQzN8wMp@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Clerk (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# NowPayments
NOWPAYMENTS_API_KEY=RS7XRMH-06SM0CP-GNEG7ZC-NBW33G9
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here

# App URL
NEXT_PUBLIC_APP_URL=https://desirefinder.com

# Search & AI (internal Docker network)
SEARXNG_API_URL=http://searxng:8080
OLLAMA_API_URL=http://ollama:11434
NODE_ENV=production
EOF
    echo "✅ Created .env template"
    echo "⚠️  Please edit .env with your actual values before continuing"
    echo ""
    read -p "Press Enter after editing .env..."
fi

echo "📦 Starting Docker stack..."
echo ""

# Start the stack
docker compose -f docker-compose.production.yml up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 30

echo ""
echo "📊 Checking service status..."
docker compose -f docker-compose.production.yml ps

echo ""
echo "🤖 Downloading AI models (this takes 5-10 minutes)..."
echo ""

# Download models
echo "Downloading dolphin-llama3..."
docker exec -it ollama ollama pull dolphin-llama3

echo ""
echo "Downloading nomic-embed-text..."
docker exec -it ollama ollama pull nomic-embed-text

echo ""
echo "✅ Models downloaded!"
echo ""

# Verify models
echo "📋 Installed models:"
docker exec -it ollama ollama list

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Your app should be available at:"
echo "  🌐 http://165.232.140.104:3000"
echo "  🌐 https://desirefinder.com (after DNS propagates)"
echo ""
echo "Check logs:"
echo "  docker compose -f docker-compose.production.yml logs -f"
echo ""
