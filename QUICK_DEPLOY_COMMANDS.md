# Quick Deploy Commands for DigitalOcean Droplet

## 🚀 Step-by-Step Commands

**Run these commands on your DigitalOcean Droplet via SSH:**

```bash
ssh root@YOUR_DROPLET_IP
```

---

## Step 1: Update System

```bash
apt-get update && apt-get upgrade -y
```

---

## Step 2: Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh
```

**Verify installation:**
```bash
docker --version
```

---

## Step 3: Install Docker Compose

```bash
apt-get install docker-compose-plugin -y
```

**Verify installation:**
```bash
docker compose version
```

---

## Step 4: Clone Repository

**Option A: If you have a GitHub repository:**
```bash
cd /root
git clone https://github.com/YOUR_USERNAME/desirefinder.git
cd desirefinder
```

**Option B: If you need to upload files manually:**
```bash
# On your local machine, use SCP:
scp -r . root@YOUR_DROPLET_IP:/root/desirefinder
```

---

## Step 5: Configure Environment Variables

```bash
cd /root/desirefinder

# Copy example file
cp .env.production.example .env.production

# Edit with your API keys
nano .env.production
```

**Required variables to set:**
```env
# Database
DB_USER=desirefinder
DB_PASS=your_secure_password_here
DB_NAME=desirefinder
DATABASE_URL=postgresql://desirefinder:your_secure_password_here@db:5432/desirefinder

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=http://YOUR_DROPLET_IP  # Update with your domain later

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Dropshipping
DROPSHIPPING_API_PROVIDER=aliexpress
DROPSHIPPING_API_KEY=your_rapidapi_key
RAPIDAPI_KEY=your_rapidapi_key
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

## Step 6: Build and Start Services

```bash
docker compose up -d --build
```

**This will:**
- Build the Next.js app
- Start PostgreSQL database
- Start Nginx reverse proxy
- Set up networking

**Wait 1-2 minutes for build to complete**

---

## Step 7: Check Service Status

```bash
docker compose ps
```

**You should see:**
```
NAME                    STATUS
desirefinder-app        Up
desirefinder-db         Up
desirefinder-nginx     Up
```

---

## Step 8: Run Database Migrations

```bash
docker compose exec app npx prisma generate
docker compose exec app npx prisma db push
```

---

## Step 9: Check Logs

```bash
# View app logs
docker compose logs -f app

# View all logs
docker compose logs -f

# Exit logs: Press Ctrl+C
```

---

## Step 10: Test Application

**Visit your droplet IP:**
```
http://YOUR_DROPLET_IP
```

**Or test the health endpoint:**
```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"...","service":"desirefinder"}
```

---

## 🔒 Optional: Setup SSL (HTTPS)

### Step 1: Point Domain to Droplet

1. Go to your domain registrar
2. Add A record: `@` → `YOUR_DROPLET_IP`
3. Wait 5-60 minutes for DNS propagation

### Step 2: Install Certbot

```bash
apt-get install certbot -y
```

### Step 3: Get SSL Certificate

```bash
# Create certbot directories
mkdir -p /root/desirefinder/certbot/www
mkdir -p /root/desirefinder/certbot/conf

# Get certificate (replace your-domain.com with your actual domain)
certbot certonly --webroot \
  -w /root/desirefinder/certbot/www \
  -d your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

### Step 4: Update Nginx Config

```bash
nano nginx/conf.d/app.conf
```

**Update these lines:**
```nginx
# Uncomment the HTTPS server block
# Update server_name:
server_name your-domain.com www.your-domain.com;

# Update certificate paths (Certbot will tell you the exact paths):
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

**Also update the HTTP server block to redirect:**
```nginx
# Comment out the proxy_pass location
# Uncomment the redirect:
location / {
    return 301 https://$host$request_uri;
}
```

### Step 5: Restart Nginx

```bash
# Test config
docker compose exec nginx nginx -t

# Restart
docker compose restart nginx
```

### Step 6: Test HTTPS

Visit: `https://your-domain.com`

---

## 🔧 Common Commands

### View Logs
```bash
# App logs
docker compose logs -f app

# Nginx logs
docker compose logs -f nginx

# Database logs
docker compose logs -f db

# All logs
docker compose logs -f
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart app
docker compose restart nginx
docker compose restart db
```

### Stop Services
```bash
docker compose down
```

### Start Services
```bash
docker compose up -d
```

### Rebuild After Code Changes
```bash
git pull origin main
docker compose up -d --build
docker compose exec app npx prisma db push  # If schema changed
```

### Access Database
```bash
docker compose exec db psql -U desirefinder -d desirefinder
```

### Access App Container
```bash
docker compose exec app sh
```

---

## 🚨 Troubleshooting

### Issue: Services won't start
```bash
# Check logs
docker compose logs

# Check if ports are in use
netstat -tulpn | grep -E ':(80|443|3000|5432)'
```

### Issue: Database connection error
```bash
# Check database is running
docker compose ps db

# Check database logs
docker compose logs db

# Verify DATABASE_URL in .env.production
cat .env.production | grep DATABASE_URL
```

### Issue: App shows 502 Bad Gateway
```bash
# Check if app is running
docker compose ps app

# Check app logs
docker compose logs app

# Restart app
docker compose restart app
```

### Issue: Can't access from browser
```bash
# Check firewall
ufw status

# Allow ports (if needed)
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] All services are running: `docker compose ps`
- [ ] App responds: `curl http://localhost:3000/api/health`
- [ ] Can access from browser: `http://YOUR_DROPLET_IP`
- [ ] Database migrations ran: Check logs for "Prisma schema loaded"
- [ ] No errors in logs: `docker compose logs app | grep -i error`

---

## 📝 Next Steps

1. **Test the application**:
   - Sign up/login
   - Search for products
   - Test checkout flow

2. **Set up monitoring**:
   - Enable DigitalOcean monitoring
   - Set up alerts

3. **Configure backups**:
   - Set up automated database backups

4. **Optimize**:
   - Monitor performance
   - Optimize slow queries

---

**Need help?** Check `DEVELOPMENT_SOP.md` for detailed troubleshooting.
