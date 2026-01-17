# DigitalOcean Deployment Checklist

## ✅ Pre-Deployment Code Fixes

### 1. Price Drift Protection ✅
- [x] `src/app/api/products/import/route.ts` - Re-fetches live price before checkout
- [x] `src/lib/dropshipping/api.ts` - `getProductById()` function for live price fetching
- [x] Aborts transaction if price increased >10%
- [x] Updates product price if change is within tolerance

### 2. Visual Quality Filtering ✅
- [x] Regex-based quick filter (removes "Generic", short descriptions)
- [x] Gemini Vision API for image quality check
- [x] Fallback to regex if Gemini fails

### 3. Drizzle Migration ✅
- [x] All database operations migrated to Prisma
- [x] Drizzle files deleted
- [x] Dependencies removed

---

## 🐳 Docker Configuration

### Files Created:
- [x] `docker-compose.yml` - Production Docker Compose
- [x] `nginx/nginx.conf` - Main Nginx configuration
- [x] `nginx/conf.d/app.conf` - App-specific Nginx config with rate limiting

### Features:
- [x] Next.js cache persistence (`next_cache` volume)
- [x] PostgreSQL database in Docker
- [x] Nginx reverse proxy with rate limiting
- [x] Image caching configuration
- [x] SSL/HTTPS ready

---

## 🔐 Security Features

### Rate Limiting:
- [x] `/api/chat` - 5 requests/minute (protects AI credits)
- [x] `/api/*` - 10 requests/second (general API)
- [x] General traffic - 30 requests/second

### Other Security:
- [x] SSL/HTTPS configuration
- [x] Security headers (X-Frame-Options, etc.)
- [x] Webhook signature verification
- [x] Price validation before checkout

---

## 📋 Deployment Steps

### 1. Provision Droplet
- [ ] Create 4GB/2vCPU Droplet on DigitalOcean
- [ ] Choose Ubuntu 22.04
- [ ] Note IP address

### 2. Server Setup
- [ ] SSH into droplet
- [ ] Install Docker and Docker Compose
- [ ] Clone repository or upload files

### 3. Configuration
- [ ] Create `.env.production` file
- [ ] Add all required environment variables
- [ ] Update `nginx/conf.d/app.conf` with your domain

### 4. DNS
- [ ] Point domain A record to droplet IP
- [ ] Wait for DNS propagation
- [ ] Verify with `dig your-domain.com`

### 5. Build & Deploy
- [ ] Run `docker compose up -d --build`
- [ ] Check logs: `docker compose logs -f app`
- [ ] Verify all services are running

### 6. SSL Certificate
- [ ] Install Certbot
- [ ] Get Let's Encrypt certificate
- [ ] Update Nginx config with certificate paths
- [ ] Restart Nginx

### 7. Database
- [ ] Run Prisma migrations: `docker compose exec app yarn db:deploy`
- [ ] Verify database connection

### 8. Firewall
- [ ] Configure UFW (allow 22, 80, 443)
- [ ] Enable firewall

### 9. Testing
- [ ] Visit `https://your-domain.com`
- [ ] Test user registration/login
- [ ] Test product search
- [ ] Test checkout flow
- [ ] Test rate limiting (should get 429 after 5 requests)

---

## 🔍 Verification Checklist

### Application
- [ ] Homepage loads
- [ ] User can sign up/login
- [ ] Product search works
- [ ] Products display with images
- [ ] Checkout flow works
- [ ] Price validation works (try with expired product)

### Security
- [ ] HTTPS redirects from HTTP
- [ ] Rate limiting works (429 after limit)
- [ ] Webhook signatures verified
- [ ] Price drift protection active

### Performance
- [ ] Images load quickly (cached)
- [ ] Next.js cache persists across restarts
- [ ] Database queries are fast

---

## 📊 Monitoring

### Logs to Monitor:
```bash
# Application logs
docker compose logs -f app

# Nginx logs
docker compose logs -f nginx

# Database logs
docker compose logs -f db
```

### Key Metrics:
- API response times
- Rate limit hits (429 errors)
- Database connection pool usage
- Memory usage (should stay under 3GB on 4GB droplet)

---

## 🚨 Common Issues & Fixes

### Issue: App won't start
**Fix**: Check environment variables, database connection

### Issue: 502 Bad Gateway
**Fix**: Check if app container is running, check app logs

### Issue: Rate limiting too strict
**Fix**: Edit `nginx/conf.d/app.conf`, increase rate limits

### Issue: Images not loading
**Fix**: Check image proxy configuration, verify external image URLs

### Issue: Database connection errors
**Fix**: Verify DATABASE_URL, check if db container is running

---

## 💰 Cost Optimization Tips

1. **Start Small**: 4GB droplet is sufficient for initial traffic
2. **Monitor Usage**: Use DigitalOcean monitoring to track resource usage
3. **Scale Up Gradually**: Upgrade droplet only when needed
4. **Use Spaces**: Consider DigitalOcean Spaces for image storage ($5/month)
5. **Cache Aggressively**: Next.js cache reduces API calls

---

## 📝 Post-Deployment

1. **Set up backups**: Automate database backups
2. **Configure monitoring**: Set up alerts for high CPU/memory
3. **Optimize images**: Consider CDN or Spaces for images
4. **Review logs**: Check for errors or warnings
5. **Test thoroughly**: Verify all features work in production

---

**Ready to deploy!** Follow `DIGITALOCEAN_DROPLET_DEPLOYMENT.md` for detailed instructions.
