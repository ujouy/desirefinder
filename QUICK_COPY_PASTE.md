# ⚡ Quick Copy-Paste Commands

**Your Droplet IP**: `165.232.140.104`

## Step 1: SSH Into Droplet

```bash
ssh root@165.232.140.104
```

## Step 2: Setup SSL (Choose One)

### Option A: Caddy (Easiest - Copy All at Once)

```bash
apt update -y && apt install -y debian-keyring debian-archive-keyring apt-transport-https && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list && apt update && apt install caddy -y && cat > /etc/caddy/Caddyfile <<'EOF'
desirefinder.com, www.desirefinder.com {
    reverse_proxy localhost:3000
}
EOF
systemctl enable caddy && systemctl start caddy && systemctl status caddy
```

**Replace `desirefinder.com` with your actual domain name!**

### Option B: Nginx (More Control)

```bash
apt update -y && apt install nginx certbot python3-certbot-nginx -y && cat > /etc/nginx/sites-available/desirefinder <<'EOF'
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
ln -s /etc/nginx/sites-available/desirefinder /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl reload nginx && certbot --nginx -d desirefinder.com -d www.desirefinder.com
```

**Replace `desirefinder.com` with your actual domain name!**

## Step 3: Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && apt install docker-compose-plugin -y
```

## Step 4: Deploy DesireFinder

```bash
# If using git
git clone <your-repo-url> desirefinder && cd desirefinder

# Or upload files via SCP from your local machine:
# scp -r . root@165.232.140.104:/root/desirefinder

# Start stack
docker compose -f docker-compose.production.yml up -d

# Download models (takes 5-10 min)
docker exec -it ollama ollama pull dolphin-llama3 && docker exec -it ollama ollama pull nomic-embed-text
```

## Step 5: Verify

```bash
# Check services
docker compose -f docker-compose.production.yml ps

# Check SSL
curl -I https://desirefinder.com
```

## 🎯 That's It!

Visit: `https://desirefinder.com`
