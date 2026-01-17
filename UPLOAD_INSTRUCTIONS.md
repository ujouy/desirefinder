# 📤 Upload Files to Droplet - Fixed Instructions

**Your Droplet IP**: `165.232.140.104`  
**Issue**: Server only accepts SSH key authentication (not passwords)

## ✅ Solution: Use Your Existing SSH Key

Since you already SSH'd in successfully, you have an SSH key. Here's how to use it:

## Option 1: WinSCP with SSH Key (Recommended)

1. **In WinSCP Login dialog:**
   - Host: `165.232.140.104`
   - Port: `22`
   - Username: `root`
   - **Password**: Leave empty
   - Click **"Advanced..."** button

2. **In Advanced Settings:**
   - Go to **"SSH" → "Authentication"**
   - Under **"Private key file"**, click **"..."** button
   - Navigate to: `C:\Users\Aidan J. D'Onofrio\.ssh\id_ed25519`
   - Click **"OK"**

3. **Click "Login"** - It should connect using your key!

## Option 2: Enable Password Auth (Temporary - Less Secure)

**In your SSH session on the droplet**, run:

```bash
# Enable password authentication
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Restart SSH service
systemctl restart sshd

# Set a password for root (optional, if not already set)
passwd root
# Enter: Tiger1985#$%
```

**Then in WinSCP:**
- Use password: `Tiger1985#$%`
- Should work now

## Option 3: Use SCP from PowerShell (Easiest)

**From your local PowerShell** (in a NEW window):

```powershell
# Navigate to project
cd D:\DesireFinder

# Upload using your SSH key (automatic)
scp -r -o StrictHostKeyChecking=no docker-compose.production.yml Dockerfile.slim root@165.232.140.104:/root/desirefinder/

# Upload folders
scp -r -o StrictHostKeyChecking=no searxng src prisma public root@165.232.140.104:/root/desirefinder/

# Upload config files
scp -o StrictHostKeyChecking=no package.json package-lock.json next.config.mjs tsconfig.json tailwind.config.ts postcss.config.js root@165.232.140.104:/root/desirefinder/
```

## Option 4: Use Git (If You Have a Repo)

**In your SSH session:**

```bash
# Install git if needed
apt install git -y

# Clone your repo (replace with your actual repo URL)
git clone <your-repo-url> /root/desirefinder
cd /root/desirefinder
```

## 🚀 After Files Are Uploaded

**In your SSH session**, run:

```bash
cd /root/desirefinder

# Create .env file
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

# Edit .env with your actual values
nano .env

# Start the stack
docker compose -f docker-compose.production.yml up -d

# Wait and check status
sleep 30
docker compose -f docker-compose.production.yml ps

# Download models
docker exec -it ollama ollama pull dolphin-llama3
docker exec -it ollama ollama pull nomic-embed-text
```

## 💡 Quick Fix for WinSCP

**Easiest solution**: In WinSCP Advanced Settings:
1. SSH → Authentication
2. Select your private key: `C:\Users\Aidan J. D'Onofrio\.ssh\id_ed25519`
3. Click OK and Login

This should work since you already connected via SSH!
