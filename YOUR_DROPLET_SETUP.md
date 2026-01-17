# 🚀 Your DesireFinder Droplet Setup

## 📋 Your Droplet Information

- **IPv4**: `165.232.140.104`
- **IPv6**: Not enabled yet
- **Private IP**: `10.124.0.2`

## ✅ What You've Already Done

- ✅ Droplet created
- ✅ DNS records added (pointing to `165.232.140.104`)
- ✅ Firewall configured (ports 22, 80, 443)

## 🔒 Next Step: Setup SSL/HTTPS

### Quick Setup (Copy-Paste Ready)

**SSH into your droplet:**
```bash
ssh root@165.232.140.104
```

### Option A: Caddy (Easiest - Recommended)

Once SSH'd in, run these commands:

```bash
# Install Caddy
apt update -y
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy -y

# Create Caddyfile (replace desirefinder.com with your actual domain)
cat > /etc/caddy/Caddyfile <<'EOF'
desirefinder.com, www.desirefinder.com {
    reverse_proxy localhost:3000
}
EOF

# Start Caddy (automatically gets SSL!)
systemctl enable caddy
systemctl start caddy

# Check status
systemctl status caddy
```

**Caddy automatically:**
- ✅ Gets SSL certificate from Let's Encrypt
- ✅ Configures HTTPS
- ✅ Auto-renews certificates
- ✅ Redirects HTTP → HTTPS

### Option B: Nginx + Let's Encrypt

```bash
# Install Nginx and Certbot
apt update -y
apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config (replace desirefinder.com with your actual domain)
cat > /etc/nginx/sites-available/desirefinder <<'EOF'
server {
    listen 80;
    server_name desirefinder.com www.desirefinder.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/desirefinder /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t
systemctl reload nginx

# Get SSL certificate (replace desirefinder.com with your domain)
certbot --nginx -d desirefinder.com -d www.desirefinder.com
```

## 🐳 Deploy DesireFinder

**After SSL is set up, deploy your app:**

```bash
# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
apt install docker-compose-plugin -y

# Clone or upload your project
# If using git:
git clone <your-repo-url> desirefinder
cd desirefinder

# Or upload files via SCP/SFTP from your local machine

# Start the stack
docker compose -f docker-compose.production.yml up -d

# Download AI models (takes 5-10 minutes)
docker exec -it ollama ollama pull dolphin-llama3
docker exec -it ollama ollama pull nomic-embed-text

# Check status
docker compose -f docker-compose.production.yml ps
```

## 🔧 Update Environment Variables

**On your droplet, edit `.env` file:**

```bash
nano /path/to/desirefinder/.env
```

**Add/update:**
```env
NEXT_PUBLIC_APP_URL=https://desirefinder.com
```

**Restart app:**
```bash
cd /path/to/desirefinder
docker compose -f docker-compose.production.yml restart desirefinder
```

## 🔗 Update Webhook URLs

### Clerk Dashboard:
1. Go to: https://dashboard.clerk.com
2. Your App → Webhooks
3. Update endpoint: `https://desirefinder.com/api/webhooks/clerk`

### NowPayments Dashboard:
1. Go to: https://nowpayments.io/dashboard
2. Settings → IPN Settings
3. Update IPN URL: `https://desirefinder.com/api/webhooks/nowpayments`

## ✅ Verify Everything Works

**Test from your local computer:**

```bash
# Test DNS
nslookup desirefinder.com
# Should return: 165.232.140.104

# Test HTTP (should redirect to HTTPS)
curl -I http://desirefinder.com

# Test HTTPS
curl -I https://desirefinder.com
# Should return: 200 OK or 301/302 redirect
```

**Visit in browser:**
- `https://desirefinder.com` → Should show your app
- `https://www.desirefinder.com` → Should redirect or show app

## 🧪 Test Webhooks

1. **Sign up a test user** → Check Clerk webhook logs
2. **Make a test payment** → Check NowPayments webhook logs

**Check logs on droplet:**
```bash
# App logs
docker compose -f docker-compose.production.yml logs -f desirefinder

# Caddy logs
journalctl -u caddy -f

# Nginx logs
tail -f /var/log/nginx/error.log
```

## 📝 Quick Checklist

- [ ] SSL/HTTPS configured (Caddy or Nginx)
- [ ] DesireFinder deployed (Docker stack running)
- [ ] AI models downloaded (dolphin-llama3, nomic-embed-text)
- [ ] Environment variables updated (NEXT_PUBLIC_APP_URL)
- [ ] Webhook URLs updated (Clerk, NowPayments)
- [ ] Site accessible at https://desirefinder.com
- [ ] Webhooks tested and working

## 🆘 Troubleshooting

**Can't SSH?**
```bash
# From your local computer
ssh root@165.232.140.104
```

**DNS not working?**
- Check DNS propagation: https://dnschecker.org
- Enter: `desirefinder.com`
- Should show: `165.232.140.104`

**SSL certificate failed?**
- Wait 5-10 minutes for DNS to fully propagate
- Ensure port 80 is open (for Let's Encrypt validation)
- Check DNS: `dig desirefinder.com` (should return `165.232.140.104`)

**App not accessible?**
- Check if running: `docker ps`
- Check Caddy/Nginx: `systemctl status caddy` or `systemctl status nginx`
- Check firewall: Ensure ports 80 and 443 are open

## 🎉 You're Done!

Once everything is set up:
- ✅ `https://desirefinder.com` → Your app
- ✅ SSL certificate installed and auto-renewing
- ✅ Webhooks configured and working
- ✅ Users can sign up and make payments
