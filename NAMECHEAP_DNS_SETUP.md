# 🌐 Namecheap DNS Setup Guide

Complete guide to point your domain to your DigitalOcean droplet.

## 📋 Prerequisites

1. **Your DigitalOcean Droplet IP Address**
   - Find it in: DigitalOcean Dashboard → Droplets → Your Droplet → Networking
   - Example: `157.230.123.45`

2. **Your Domain Registered at Namecheap**
   - Example: `desirefinder.com`

## 🔧 Step 1: Get Your Droplet IP

1. Log into [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. Click on your droplet
3. Copy the **IPv4 Address** (looks like `157.230.123.45`)
4. **Save this IP** - you'll need it for DNS records

## 🔧 Step 2: Configure Namecheap DNS

### Option A: Use Namecheap BasicDNS (Recommended for Beginners)

1. **Log into Namecheap**
   - Go to https://www.namecheap.com
   - Sign in → Domain List

2. **Select Your Domain**
   - Click "Manage" next to `desirefinder.com`

3. **Go to Advanced DNS Tab**
   - Click "Advanced DNS" tab at the top

4. **Add DNS Records**

   **Delete existing A records** (if any) for:
   - `@` (root domain)
   - `www`

   **Add these NEW records:**

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | A Record | `@` | `YOUR_DROPLET_IP` | Automatic |
   | A Record | `www` | `YOUR_DROPLET_IP` | Automatic |

   **Example:**
   - If your IP is `157.230.123.45`:
     - A Record: `@` → `157.230.123.45`
     - A Record: `www` → `157.230.123.45`

5. **Save Changes**
   - Click the green checkmark to save each record
   - Wait 5-10 minutes for DNS to propagate

### Option B: Use DigitalOcean Nameservers (Advanced)

If you want to manage DNS in DigitalOcean:

1. **Get DigitalOcean Nameservers**
   - In DigitalOcean Dashboard → Networking → Domains
   - Add your domain → Copy nameservers:
     - `ns1.digitalocean.com`
     - `ns2.digitalocean.com`
     - `ns3.digitalocean.com`

2. **Update Namecheap Nameservers**
   - Namecheap → Domain List → Manage
   - "Nameservers" section → "Custom DNS"
   - Enter the 3 DigitalOcean nameservers
   - Save

3. **Add DNS Records in DigitalOcean**
   - DigitalOcean → Networking → Domains → Your Domain
   - Add A Record:
     - Hostname: `@`
     - Will direct to: `YOUR_DROPLET_IP`
   - Add A Record:
     - Hostname: `www`
     - Will direct to: `YOUR_DROPLET_IP`

## 🔒 Step 3: Setup SSL/HTTPS (Required for Webhooks)

Your webhooks (Clerk, NowPayments) require HTTPS. You need a reverse proxy.

### Option A: Nginx + Let's Encrypt (Recommended)

**On your DigitalOcean droplet:**

```bash
# 1. Install Nginx
sudo apt update
sudo apt install nginx -y

# 2. Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y

# 3. Configure Nginx
sudo nano /etc/nginx/sites-available/desirefinder
```

**Paste this configuration:**

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

**Enable the site:**

```bash
sudo ln -s /etc/nginx/sites-available/desirefinder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Get SSL Certificate:**

```bash
sudo certbot --nginx -d desirefinder.com -d www.desirefinder.com
```

Follow the prompts. Certbot will automatically:
- Get SSL certificate from Let's Encrypt
- Configure HTTPS
- Set up auto-renewal

### Option B: Caddy (Easier, Auto-SSL)

**On your DigitalOcean droplet:**

```bash
# 1. Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy -y

# 2. Create Caddyfile
sudo nano /etc/caddy/Caddyfile
```

**Paste this:**

```
desirefinder.com, www.desirefinder.com {
    reverse_proxy localhost:3000
}
```

**Start Caddy:**

```bash
sudo systemctl enable caddy
sudo systemctl start caddy
```

Caddy automatically:
- Gets SSL certificate
- Configures HTTPS
- Auto-renews certificates

## ✅ Step 4: Verify DNS Propagation

**Check if DNS is working:**

```bash
# From your local computer
nslookup desirefinder.com
nslookup www.desirefinder.com
```

Both should return your droplet IP.

**Or use online tools:**
- https://dnschecker.org
- Enter `desirefinder.com` → Check A record
- Should show your droplet IP

## ✅ Step 5: Test Your Setup

1. **Wait 5-30 minutes** for DNS to propagate
2. **Visit** `http://desirefinder.com` (should redirect to HTTPS)
3. **Visit** `https://desirefinder.com` (should show your app)
4. **Test webhooks:**
   - Sign up a test user → Check Clerk webhook
   - Make a test payment → Check NowPayments webhook

## 🔧 Step 6: Update Environment Variables

**On your droplet, update `.env`:**

```env
NEXT_PUBLIC_APP_URL=https://desirefinder.com
```

**Update webhook URLs in:**

1. **Clerk Dashboard:**
   - Webhook URL: `https://desirefinder.com/api/webhooks/clerk`

2. **NowPayments Dashboard:**
   - IPN URL: `https://desirefinder.com/api/webhooks/nowpayments`

## 📋 Complete DNS Records Summary

**For Namecheap BasicDNS:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `@` | `YOUR_DROPLET_IP` | Automatic |
| A | `www` | `YOUR_DROPLET_IP` | Automatic |

**That's it!** No CNAME, MX, or other records needed unless you want email.

## ⚠️ Important Notes

1. **DNS Propagation**: Can take 5 minutes to 48 hours (usually 5-30 minutes)
2. **SSL Required**: Webhooks won't work without HTTPS
3. **Port 3000**: Your app runs on port 3000, reverse proxy forwards to it
4. **Firewall**: Make sure port 80 and 443 are open on your droplet

## 🐛 Troubleshooting

**DNS not working?**
- Wait longer (up to 48 hours)
- Clear your browser cache
- Try from different network/device
- Check DNS propagation: https://dnschecker.org

**Can't access site?**
- Check if app is running: `docker ps` on droplet
- Check Nginx/Caddy: `sudo systemctl status nginx` or `sudo systemctl status caddy`
- Check firewall: `sudo ufw status`

**SSL not working?**
- Make sure port 443 is open: `sudo ufw allow 443`
- Check Certbot logs: `sudo certbot certificates`
- For Caddy: Check logs: `sudo journalctl -u caddy`

## 🎉 You're Done!

Once DNS propagates and SSL is configured:
- ✅ `https://desirefinder.com` → Your app
- ✅ `https://www.desirefinder.com` → Your app
- ✅ Webhooks work (Clerk, NowPayments)
- ✅ Users can access your site
