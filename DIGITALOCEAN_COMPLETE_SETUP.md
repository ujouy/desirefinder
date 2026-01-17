# 🚀 Complete DigitalOcean Setup for DesireFinder

Automated setup guide for creating droplet, DNS, and firewall.

## 📋 Current Account Status

✅ **Account**: aidandonofrio55@gmail.com  
✅ **Status**: Active  
✅ **Droplet Limit**: 10 droplets  
✅ **Email Verified**: Yes

## 🎯 Step 1: Check Existing Droplets

Since the MCP doesn't have direct droplet listing, let's check via the DigitalOcean dashboard or API.

**Option A: Check via Dashboard**
1. Go to https://cloud.digitalocean.com/droplets
2. See if you have any existing droplets

**Option B: Check via API (I can help with this)**

## 🔧 Step 2: Create Droplet

Since droplet creation via MCP isn't available, here's the manual process:

### Via DigitalOcean Dashboard:

1. **Go to**: https://cloud.digitalocean.com/droplets/new

2. **Configure Droplet**:
   - **Choose an image**: Ubuntu 22.04 LTS
   - **Choose a plan**: 
     - **Minimum**: Regular with 4 vCPU / 8GB RAM ($48/month)
     - **Recommended**: Regular with 8 vCPU / 16GB RAM ($96/month)
   - **Choose a datacenter region**: Select closest to you
   - **Authentication**: 
     - Add your SSH key (recommended)
     - Or use password (less secure)
   - **Finalize and create**:
     - **Droplet name**: `desirefinder-production`
     - **Tags**: `desirefinder`, `production` (optional)
     - Click "Create Droplet"

3. **Wait 1-2 minutes** for droplet to be created

4. **Get the IP Address**:
   - Once created, copy the IPv4 address
   - Example: `157.230.123.45`

## 🔒 Step 3: Create Firewall

### Via DigitalOcean Dashboard:

1. **Go to**: https://cloud.digitalocean.com/networking/firewalls

2. **Create Firewall**:
   - Click "Create Firewall"
   - **Name**: `desirefinder-firewall`

3. **Inbound Rules**:
   ```
   Type: Custom
   Protocol: TCP
   Port Range: 22
   Sources: All IPv4, All IPv6
   Description: SSH Access
   
   Type: Custom
   Protocol: TCP
   Port Range: 80
   Sources: All IPv4, All IPv6
   Description: HTTP
   
   Type: Custom
   Protocol: TCP
   Port Range: 443
   Sources: All IPv4, All IPv6
   Description: HTTPS
   ```

4. **Outbound Rules**:
   - Keep default (Allow all)

5. **Apply to Droplets**:
   - Select your `desirefinder-production` droplet
   - Click "Create Firewall"

## 🌐 Step 4: Setup DNS

### Option A: Use DigitalOcean DNS (Recommended)

1. **Go to**: https://cloud.digitalocean.com/networking/domains

2. **Add Domain**:
   - Click "Add Domain"
   - Enter: `desirefinder.com`
   - Click "Add Domain"

3. **Add DNS Records**:
   - **A Record**:
     - Hostname: `@`
     - Will direct to: `YOUR_DROPLET_IP`
     - TTL: 3600
   - **A Record**:
     - Hostname: `www`
     - Will direct to: `YOUR_DROPLET_IP`
     - TTL: 3600

4. **Update Namecheap Nameservers**:
   - Go to Namecheap → Domain List → Manage
   - "Nameservers" section → "Custom DNS"
   - Enter:
     - `ns1.digitalocean.com`
     - `ns2.digitalocean.com`
     - `ns3.digitalocean.com`
   - Save

### Option B: Use Namecheap DNS (Keep Current Setup)

Follow the guide in `NAMECHEAP_DNS_SETUP.md`

## ✅ Step 5: Verify Setup

1. **Check Droplet Status**:
   ```bash
   # SSH into your droplet
   ssh root@YOUR_DROPLET_IP
   
   # Verify it's running
   uptime
   ```

2. **Check Firewall**:
   - DigitalOcean Dashboard → Networking → Firewalls
   - Verify `desirefinder-firewall` is attached to your droplet

3. **Check DNS**:
   ```bash
   # From your local computer
   nslookup desirefinder.com
   # Should return your droplet IP
   ```

## 🚀 Step 6: Deploy DesireFinder

Once your droplet is ready:

1. **SSH into Droplet**:
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
   apt install docker-compose-plugin -y
   ```

3. **Clone/Upload Project**:
   ```bash
   git clone <your-repo> desirefinder
   cd desirefinder
   ```

4. **Start Stack**:
   ```bash
   docker compose -f docker-compose.production.yml up -d
   ```

5. **Download Models**:
   ```bash
   docker exec -it ollama ollama pull dolphin-llama3
   docker exec -it ollama ollama pull nomic-embed-text
   ```

6. **Access App**:
   - Visit: `http://YOUR_DROPLET_IP:3000`

## 📝 Quick Checklist

- [ ] Droplet created (4 vCPU / 8GB RAM minimum)
- [ ] Firewall created and attached
- [ ] DNS records added (A records for @ and www)
- [ ] Nameservers updated (if using DO DNS)
- [ ] Docker installed on droplet
- [ ] DesireFinder deployed
- [ ] Models downloaded
- [ ] SSL/HTTPS configured (see NAMECHEAP_DNS_SETUP.md)

## 🎉 You're Done!

Your complete setup is ready:
- ✅ Droplet running
- ✅ Firewall protecting it
- ✅ DNS pointing to it
- ✅ DesireFinder deployed

## 💡 Next Steps

1. **Setup SSL/HTTPS** (see `NAMECHEAP_DNS_SETUP.md`)
2. **Configure Clerk webhooks** (use your domain)
3. **Configure NowPayments webhooks** (use your domain)
4. **Test the app** at `https://desirefinder.com`
