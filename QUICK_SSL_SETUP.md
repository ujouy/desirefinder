# 🔒 Quick SSL/HTTPS Setup Guide

Since you've already created the droplet, added DNS, and set up the firewall, here's how to complete the SSL setup.

## 🎯 Choose Your Method

### Option A: Nginx + Let's Encrypt (More Control)
- Manual configuration
- Full control over Nginx settings
- See: `scripts/setup-ssl.sh`

### Option B: Caddy (Easier, Auto-SSL)
- Automatic SSL certificates
- Simpler configuration
- See: `scripts/setup-ssl-caddy.sh`

## 🚀 Quick Setup (Choose One)

### Method 1: Automated Script (Recommended)

**SSH into your droplet:**
```bash
ssh root@YOUR_DROPLET_IP
```

**Option A: Nginx (Recommended)**
```bash
# Upload or clone the script
cd /root
wget https://raw.githubusercontent.com/your-repo/DesireFinder/main/scripts/setup-ssl.sh
# OR copy the script content manually

# Make executable
chmod +x setup-ssl.sh

# Run it
sudo ./setup-ssl.sh
```

**Option B: Caddy (Easier)**
```bash
# Upload or clone the script
cd /root
wget https://raw.githubusercontent.com/your-repo/DesireFinder/main/scripts/setup-ssl-caddy.sh
# OR copy the script content manually

# Make executable
chmod +x setup-ssl-caddy.sh

# Run it
sudo ./setup-ssl-caddy.sh
```

### Method 2: Manual Setup (Step-by-Step)

#### Using Nginx:

```bash
# 1. SSH into droplet
ssh root@YOUR_DROPLET_IP

# 2. Update system
apt update && apt upgrade -y

# 3. Install Nginx and Certbot
apt install nginx certbot python3-certbot-nginx -y

# 4. Create Nginx config
nano /etc/nginx/sites-available/desirefinder
```

**Paste this (replace desirefinder.com with your domain):**
```nginx
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
```

**Save and continue:**
```bash
# 5. Enable site
ln -s /etc/nginx/sites-available/desirefinder /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default if exists

# 6. Test and reload Nginx
nginx -t
systemctl reload nginx

# 7. Get SSL certificate
certbot --nginx -d desirefinder.com -d www.desirefinder.com
```

**Follow the prompts:**
- Enter email address
- Agree to terms
- Choose redirect HTTP to HTTPS (option 2)

#### Using Caddy:

```bash
# 1. SSH into droplet
ssh root@YOUR_DROPLET_IP

# 2. Install Caddy
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy -y

# 3. Create Caddyfile
nano /etc/caddy/Caddyfile
```

**Paste this (replace desirefinder.com with your domain):**
```
desirefinder.com, www.desirefinder.com {
    reverse_proxy localhost:3000
}
```

**Save and start:**
```bash
# 4. Start Caddy
systemctl enable caddy
systemctl start caddy

# 5. Check status
systemctl status caddy
```

Caddy automatically gets SSL certificates!

## ✅ Verify Setup

After setup, test:

```bash
# Test HTTPS
curl -I https://desirefinder.com

# Should return 200 or 301/302
```

**Visit in browser:**
- `https://desirefinder.com` → Should show your app
- `https://www.desirefinder.com` → Should redirect or show app

## 🔧 Update Environment Variables

**On your droplet, update `.env`:**
```bash
nano /path/to/desirefinder/.env
```

Add/update:
```env
NEXT_PUBLIC_APP_URL=https://desirefinder.com
```

**Restart your app:**
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

## 🧪 Test Everything

1. **Visit site**: `https://desirefinder.com`
2. **Sign up**: Test Clerk webhook
3. **Make payment**: Test NowPayments webhook
4. **Check logs**: 
   ```bash
   # Nginx
   sudo tail -f /var/log/nginx/error.log
   
   # Caddy
   sudo journalctl -u caddy -f
   
   # Your app
   docker compose -f docker-compose.production.yml logs -f desirefinder
   ```

## 🐛 Troubleshooting

**SSL certificate failed?**
- Wait 5-10 minutes for DNS to fully propagate
- Ensure port 80 is open (for Let's Encrypt validation)
- Check DNS: `dig desirefinder.com`

**Can't access site?**
- Check if app is running: `docker ps`
- Check Nginx/Caddy: `sudo systemctl status nginx` or `sudo systemctl status caddy`
- Check firewall: Ensure ports 80 and 443 are open

**Certificate not auto-renewing?**
- Nginx: Certbot sets up auto-renewal automatically
- Caddy: Auto-renewal is built-in
- Test renewal: `sudo certbot renew --dry-run` (Nginx) or check Caddy logs

## 🎉 Done!

Your site should now be:
- ✅ Accessible at `https://desirefinder.com`
- ✅ SSL certificate installed
- ✅ Auto-renewal configured
- ✅ Webhooks ready
