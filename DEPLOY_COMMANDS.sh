#!/bin/bash
# DesireFinder - Quick Deploy Commands
# Run these commands on your DigitalOcean Droplet

set -e

echo "🚀 DesireFinder Deployment Commands"
echo "===================================="
echo ""

# Step 1: Update system
echo "📦 Step 1: Updating system..."
apt-get update && apt-get upgrade -y

# Step 2: Install Docker
echo "🐳 Step 2: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Step 3: Install Docker Compose
echo "📦 Step 3: Installing Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    apt-get install docker-compose-plugin -y
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Step 4: Clone repository (if not already cloned)
echo "📥 Step 4: Cloning repository..."
if [ ! -d "desirefinder" ]; then
    echo "Enter your GitHub repository URL (or press Enter to skip):"
    read REPO_URL
    if [ ! -z "$REPO_URL" ]; then
        git clone $REPO_URL desirefinder
        cd desirefinder
    else
        echo "⚠️  Skipping clone. Make sure you're in the project directory."
    fi
else
    echo "✅ Repository already exists"
    cd desirefinder
fi

# Step 5: Create .env.production
echo "⚙️  Step 5: Setting up environment variables..."
if [ ! -f .env.production ]; then
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
        echo "✅ Created .env.production from example"
        echo "⚠️  IMPORTANT: Edit .env.production with your API keys:"
        echo "   nano .env.production"
    else
        echo "⚠️  .env.production.example not found. Creating empty .env.production"
        touch .env.production
    fi
else
    echo "✅ .env.production already exists"
fi

# Step 6: Build and start services
echo "🔨 Step 6: Building and starting services..."
docker compose up -d --build

# Step 7: Wait for services
echo "⏳ Step 7: Waiting for services to start..."
sleep 10

# Step 8: Run database migrations
echo "🗄️  Step 8: Running database migrations..."
docker compose exec -T app npx prisma generate
docker compose exec -T app npx prisma db push

# Step 9: Check status
echo "📊 Step 9: Checking service status..."
docker compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.production with your API keys: nano .env.production"
echo "2. Restart services: docker compose restart app"
echo "3. Check logs: docker compose logs -f app"
echo "4. Visit your droplet IP: http://YOUR_DROPLET_IP"
echo ""
echo "🔒 To setup SSL:"
echo "1. Point your domain to this droplet's IP"
echo "2. Run: certbot certonly --webroot -w /root/desirefinder/certbot/www -d your-domain.com"
echo "3. Update nginx/conf.d/app.conf with certificate paths"
echo "4. Restart nginx: docker compose restart nginx"
