# DigitalOcean Droplet Deployment Guide

## 🎯 Overview

This guide deploys DesireFinder on a DigitalOcean Droplet (Virtual Machine) for cost-effective hosting with full control over caching, rate limiting, and security.

**Recommended Setup**: 4GB RAM / 2 vCPU Droplet ($24/month)

---

## 📋 Prerequisites

- DigitalOcean account
- Domain name (optional, but recommended)
- API keys:
  - Gemini API Key
  - Stripe Secret Key
  - Clerk Keys
  - Dropshipping API Key (AliExpress/CJ/SerpApi)

---

## 🚀 Step 1: Provision Droplet

1. **Create Droplet**:
   - Go to DigitalOcean Dashboard → Create → Droplets
   - **Image**: Ubuntu 22.04 (LTS)
   - **Plan**: Regular Intel (4GB RAM / 2 vCPU) - $24/month
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) or root password
   - **Hostname**: `desirefinder-production`

2. **Note the IP Address**: You'll need this for DNS configuration

---

## 🔧 Step 2: Initial Server Setup

SSH into your droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

Update system:

```bash
apt-get update && apt-get upgrade -y
```

Install Docker and Docker Compose:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

---

## 📁 Step 3: Clone Repository

```bash
# Install Git if not present
apt-get install git -y

# Clone your repository
cd /root
git clone https://github.com/your-username/desirefinder.git
cd desirefinder
```

**OR** upload files via SCP:

```bash
# From your local machine
scp -r . root@YOUR_DROPLET_IP:/root/desirefinder
```

---

## 🔐 Step 4: Configure Environment Variables

Create `.env.production` file:

```bash
cd /root/desirefinder
nano .env.production
```

Add your environment variables:

```env
# Database (PostgreSQL in Docker)
DB_USER=desirefinder
DB_PASS=your_secure_password_here
DB_NAME=desirefinder
DATABASE_URL=postgresql://desirefinder:your_secure_password_here@db:5432/desirefinder

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Dropshipping APIs
DROPSHIPPING_API_PROVIDER=aliexpress
DROPSHIPPING_API_KEY=your_rapidapi_key
ALIEXPRESS_API_URL=https://aliexpress-data.p.rapidapi.com

# NowPayments (optional)
NOWPAYMENTS_API_KEY=your_key
NOWPAYMENTS_IPN_SECRET=your_secret

# Node Environment
NODE_ENV=production
```

Save and exit (Ctrl+X, Y, Enter)

---

## 🌐 Step 5: Configure DNS

1. **Point Domain to Droplet**:
   - Go to your domain registrar (Namecheap, GoDaddy, etc.)
   - Add A Record:
     - **Host**: `@` (or `www`)
     - **Value**: `YOUR_DROPLET_IP`
     - **TTL**: 3600

2. **Wait for DNS Propagation** (5-60 minutes)

3. **Verify DNS**:
   ```bash
   dig your-domain.com
   # Should return your droplet IP
   ```

---

## 🐳 Step 6: Build and Start Services

```bash
cd /root/desirefinder

# Build and start all services
docker compose up -d --build

# Check logs
docker compose logs -f app
```

**Expected output**: Services should start successfully:
- ✅ `desirefinder-app` (Next.js)
- ✅ `desirefinder-db` (PostgreSQL)
- ✅ `desirefinder-nginx` (Nginx)

---

## 🔒 Step 7: Setup SSL (HTTPS)

### Option A: Using Certbot (Let's Encrypt)

1. **Update Nginx config** with your domain:
   ```bash
   nano nginx/conf.d/app.conf
   # Replace `your-domain.com` with your actual domain
   ```

2. **Run Certbot**:
   ```bash
   # Install certbot
   apt-get install certbot -y

   # Get certificate
   certbot certonly --webroot \
     -w /root/desirefinder/certbot/www \
     -d your-domain.com \
     -d www.your-domain.com \
     --email your-email@example.com \
     --agree-tos \
     --non-interactive
   ```

3. **Update Nginx config** with certificate paths:
   ```bash
   nano nginx/conf.d/app.conf
   # Update SSL certificate paths to match certbot output
   ```

4. **Restart Nginx**:
   ```bash
   docker compose restart nginx
   ```

### Option B: Manual SSL Certificate

If you have your own SSL certificate:
1. Place certificate files in `certbot/conf/live/your-domain.com/`
2. Update `nginx/conf.d/app.conf` with correct paths
3. Restart Nginx

---

## 🗄️ Step 8: Run Database Migrations

```bash
# Generate Prisma client
docker compose exec app yarn db:generate

# Run migrations
docker compose exec app yarn db:deploy
```

---

## ✅ Step 9: Verify Deployment

1. **Check Services**:
   ```bash
   docker compose ps
   # All services should be "Up"
   ```

2. **Check Logs**:
   ```bash
   docker compose logs app
   docker compose logs nginx
   ```

3. **Test Application**:
   - Visit `https://your-domain.com`
   - Should see DesireFinder homepage
   - Try creating an account and searching

4. **Test Rate Limiting**:
   - Try sending multiple requests to `/api/chat` quickly
   - Should get 429 (Too Many Requests) after 5 requests/minute

---

## 🔧 Step 10: Firewall Configuration

Configure UFW firewall:

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# App logs
docker compose logs -f app

# Nginx logs
docker compose logs -f nginx

# Database logs
docker compose logs -f db
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart app
```

### Update Application

```bash
cd /root/desirefinder

# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build

# Run migrations if needed
docker compose exec app yarn db:deploy
```

### Backup Database

```bash
# Create backup
docker compose exec db pg_dump -U desirefinder desirefinder > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T db psql -U desirefinder desirefinder < backup_20240101.sql
```

---

## 🛡️ Security Checklist

- [x] ✅ Rate limiting configured (5 chats/minute)
- [x] ✅ SSL/HTTPS enabled
- [x] ✅ Firewall configured (only 22, 80, 443 open)
- [x] ✅ Environment variables secured (`.env.production` not in git)
- [x] ✅ Database password strong
- [x] ✅ Clerk webhook secret configured
- [x] ✅ Stripe webhook signature verification enabled
- [x] ✅ Price drift protection enabled
- [x] ✅ Image quality filtering enabled

---

## 💰 Cost Breakdown

**Monthly Costs**:
- Droplet (4GB/2vCPU): $24/month
- Domain: ~$12/year (~$1/month)
- **Total**: ~$25/month

**Optional Add-ons**:
- DigitalOcean Spaces (S3-compatible): $5/month (for image storage)
- Managed PostgreSQL: $15/month (if you want managed DB)
- Monitoring: Free (DigitalOcean provides basic monitoring)

---

## 🚨 Troubleshooting

### App won't start

```bash
# Check logs
docker compose logs app

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port 3000 already in use
```

### Database connection errors

```bash
# Check if database is running
docker compose ps db

# Check database logs
docker compose logs db

# Verify DATABASE_URL in .env.production
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
docker compose ps app

# Check app logs
docker compose logs app

# Verify nginx config
docker compose exec nginx nginx -t
```

### Rate limiting too strict

Edit `nginx/conf.d/app.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=ai_limit:10m rate=10r/m; # Increase from 5r/m
```

Then restart:
```bash
docker compose restart nginx
```

---

## 📝 Next Steps

1. **Set up monitoring**: Configure DigitalOcean monitoring alerts
2. **Set up backups**: Automate database backups
3. **Optimize images**: Consider DigitalOcean Spaces for image storage
4. **Scale up**: Upgrade droplet if traffic increases
5. **CDN**: Consider Cloudflare for additional caching and DDoS protection

---

## 🎉 Success!

Your DesireFinder application is now running on DigitalOcean with:
- ✅ Production-ready PostgreSQL database
- ✅ Nginx reverse proxy with rate limiting
- ✅ SSL/HTTPS encryption
- ✅ Persistent caching
- ✅ Security headers
- ✅ Image caching

Visit `https://your-domain.com` to see your live application!
