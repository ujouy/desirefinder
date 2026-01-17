# 🔒 DigitalOcean Firewall Rules Guide

Complete guide for setting up firewall rules for DesireFinder.

## 📋 Required Firewall Rules

### Inbound Rules (Traffic Coming INTO Your Droplet)

| Type | Protocol | Port Range | Sources | Description |
|------|----------|------------|---------|-------------|
| Custom | TCP | 22 | All IPv4, All IPv6 | SSH Access |
| Custom | TCP | 80 | All IPv4, All IPv6 | HTTP (for Let's Encrypt) |
| Custom | TCP | 443 | All IPv4, All IPv6 | HTTPS (SSL) |

### Outbound Rules (Traffic Going OUT FROM Your Droplet)

| Type | Protocol | Port Range | Destinations | Description |
|------|----------|------------|--------------|-------------|
| Custom | TCP | All | All IPv4, All IPv6 | All TCP outbound |
| Custom | UDP | All | All IPv4, All IPv6 | All UDP outbound |
| Custom | ICMP | All | All IPv4, All IPv6 | Ping/ICMP |

**Note**: Outbound rules allow your droplet to:
- Download packages (apt, docker images)
- Make API calls (Clerk, NowPayments)
- Access external services
- Pull Docker images

## 🎯 Step-by-Step: Create Firewall in DigitalOcean Dashboard

### Method 1: Via Dashboard (Visual)

1. **Go to**: https://cloud.digitalocean.com/networking/firewalls

2. **Click**: "Create Firewall"

3. **Basic Info**:
   - **Name**: `desirefinder-firewall`
   - **Description**: `Firewall for DesireFinder production server`

4. **Inbound Rules** - Click "Add Rule" for each:

   **Rule 1: SSH**
   - Type: `Custom`
   - Protocol: `TCP`
   - Port Range: `22`
   - Sources: 
     - Click "Add Source"
     - Select: `All IPv4` and `All IPv6`
   - Description: `SSH Access`

   **Rule 2: HTTP**
   - Type: `Custom`
   - Protocol: `TCP`
   - Port Range: `80`
   - Sources: `All IPv4` and `All IPv6`
   - Description: `HTTP`

   **Rule 3: HTTPS**
   - Type: `Custom`
   - Protocol: `TCP`
   - Port Range: `443`
   - Sources: `All IPv4` and `All IPv6`
   - Description: `HTTPS`

5. **Outbound Rules** - Keep defaults or add:

   **Rule 1: TCP**
   - Type: `Custom`
   - Protocol: `TCP`
   - Port Range: `All`
   - Destinations: `All IPv4` and `All IPv6`

   **Rule 2: UDP**
   - Type: `Custom`
   - Protocol: `UDP`
   - Port Range: `All`
   - Destinations: `All IPv4` and `All IPv6`

   **Rule 3: ICMP**
   - Type: `Custom`
   - Protocol: `ICMP`
   - Port Range: `All`
   - Destinations: `All IPv4` and `All IPv6`

6. **Apply to Droplets**:
   - Select your `desirefinder-production` droplet
   - (Or attach later)

7. **Click**: "Create Firewall"

### Method 2: Via doctl CLI

```bash
# Create firewall with all rules
doctl compute firewall create \
  --name desirefinder-firewall \
  --inbound-rules "protocol:tcp,ports:22,address:0.0.0.0/0,address:::/0" \
  --inbound-rules "protocol:tcp,ports:80,address:0.0.0.0/0,address:::/0" \
  --inbound-rules "protocol:tcp,ports:443,address:0.0.0.0/0,address:::/0" \
  --outbound-rules "protocol:tcp,ports:all,address:0.0.0.0/0,address:::/0" \
  --outbound-rules "protocol:udp,ports:all,address:0.0.0.0/0,address:::/0" \
  --outbound-rules "protocol:icmp,address:0.0.0.0/0,address:::/0" \
  --droplet-ids YOUR_DROPLET_ID
```

## 🔍 What Each Port Does

### Port 22 (SSH)
- **Purpose**: Secure shell access to your droplet
- **Why needed**: To manage your server, deploy code, run commands
- **Security**: Use SSH keys, not passwords

### Port 80 (HTTP)
- **Purpose**: Unencrypted web traffic
- **Why needed**: 
  - Let's Encrypt uses port 80 for certificate validation
  - Redirects HTTP → HTTPS
- **Security**: Should redirect to HTTPS

### Port 443 (HTTPS)
- **Purpose**: Encrypted web traffic (SSL/TLS)
- **Why needed**: 
  - Secure access to your app
  - Required for webhooks (Clerk, NowPayments)
  - User-facing website
- **Security**: This is your main port for users

## ⚠️ Security Considerations

### Option A: Restrict SSH (More Secure)

If you want to restrict SSH to only your IP:

**Inbound Rule for SSH**:
- Port: `22`
- Sources: `Your IP Address` (instead of All IPv4/IPv6)
- Example: `123.45.67.89/32`

**How to find your IP**:
```bash
# On your local computer
curl ifconfig.me
```

### Option B: Keep SSH Open (Easier)

- Keep SSH open to all IPs
- Use SSH keys (not passwords)
- Disable password authentication on server

**On your droplet**:
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set:
PasswordAuthentication no
PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart sshd
```

## 🧪 Testing Firewall Rules

After creating firewall, test:

```bash
# Test SSH (should work)
ssh root@YOUR_DROPLET_IP

# Test HTTP (should work)
curl http://YOUR_DROPLET_IP

# Test HTTPS (after SSL setup)
curl https://YOUR_DROPLET_IP
```

## 📝 Quick Reference

**Minimum Required Inbound Rules**:
- ✅ Port 22 (SSH)
- ✅ Port 80 (HTTP)
- ✅ Port 443 (HTTPS)

**Minimum Required Outbound Rules**:
- ✅ TCP All (for downloads, API calls)
- ✅ UDP All (for DNS, etc.)
- ✅ ICMP All (for ping)

## 🎯 Complete Firewall Configuration

Here's the exact configuration you need:

**Firewall Name**: `desirefinder-firewall`

**Inbound Rules**:
```
1. TCP:22   → All IPv4, All IPv6  (SSH)
2. TCP:80   → All IPv4, All IPv6  (HTTP)
3. TCP:443  → All IPv4, All IPv6  (HTTPS)
```

**Outbound Rules**:
```
1. TCP:All  → All IPv4, All IPv6  (Downloads, API calls)
2. UDP:All  → All IPv4, All IPv6  (DNS, etc.)
3. ICMP:All → All IPv4, All IPv6  (Ping)
```

## ✅ Verification Checklist

After creating firewall:

- [ ] Firewall created with name `desirefinder-firewall`
- [ ] Inbound rules: 22, 80, 443
- [ ] Outbound rules: TCP All, UDP All, ICMP All
- [ ] Firewall attached to your droplet
- [ ] SSH access works
- [ ] HTTP access works (after deployment)
- [ ] HTTPS access works (after SSL setup)

## 🚀 Next Steps

1. **Create firewall** (using guide above)
2. **Attach to droplet** (if not done during creation)
3. **Deploy DesireFinder** (see `QUICK_START_DO.md`)
4. **Setup SSL/HTTPS** (see `NAMECHEAP_DNS_SETUP.md`)

## 🆘 Troubleshooting

**Can't SSH?**
- Check firewall is attached to droplet
- Verify port 22 rule exists
- Check droplet is running

**Can't access website?**
- Check ports 80 and 443 rules
- Verify app is running on droplet
- Check Nginx/Caddy is configured

**Outbound blocked?**
- Verify outbound rules allow TCP/UDP/ICMP
- Check if app needs specific outbound ports
