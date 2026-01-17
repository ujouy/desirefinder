# DesireFinder Development SOP
## Standard Operating Procedure for Making Changes

**Status**: Production-Ready Architecture  
**Last Updated**: After Drizzle → Prisma Migration & DigitalOcean Setup

---

## 📋 Overview

With the codebase consolidated (Single ORM, Dockerized, DigitalOcean-ready), your workflow has shifted from "hacking" to a structured DevOps lifecycle. This SOP defines the standard procedures for making changes to the DesireFinder architecture.

---

## 1. Database Schema Changes (The Prisma Workflow)

**Since Drizzle is removed, you no longer use `drizzle-kit`. All database changes must go through Prisma.**

### When to Use:
- Adding new user fields
- Tracking new analytics
- Changing order status types
- Adding new models (e.g., `Wishlist`, `Review`)

### Step-by-Step Process:

#### Step 1: Modify Schema
Edit `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  credits   Int      @default(3)
  isPremium Boolean  @default(false)
  // NEW FIELD EXAMPLE:
  phoneNumber String? // Optional phone number
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // ... relations
}
```

#### Step 2: Update Local Database
```bash
npx prisma db push
```
**What this does**: Syncs your local Postgres container with the schema changes.  
**Note**: This is non-destructive for development. For production, use migrations.

#### Step 3: Update Type Definitions
```bash
npx prisma generate
```
**What this does**: Updates `node_modules/@prisma/client` so TypeScript knows about your new fields.  
**Critical**: You must run this after every schema change, or TypeScript will show errors.

#### Step 4: Production Deploy
On the DigitalOcean droplet, after pulling the code:

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Navigate to project
cd desirefinder

# Pull latest code
git pull origin main

# Apply database changes
docker-compose exec app npx prisma db push

# Regenerate Prisma client in container
docker-compose exec app npx prisma generate
```

### ⚠️ Important Notes:
- **Never use `drizzle-kit`** - It's been removed
- **Always run `prisma generate`** after schema changes
- **For production migrations**: Use `prisma migrate dev` locally, then `prisma migrate deploy` on server

---

## 2. Modifying the AI Logic ("Desire" Tuning)

The core logic is split between **Agents (Behavior)** and **Prompts (Personality)**.

### A. Changing How the AI Searches (Logic)

**File**: `src/lib/agents/search/researcher/actions/shoppingSearch.ts`

**What to modify**:
- How it calls the Dropshipping API
- Quality filter thresholds (rating, orders, shipping)
- Markup pricing multiplier (currently 2.5x)
- Product sorting/ranking logic

**Example: Change Markup from 2.5x to 3.0x**

```typescript
// src/lib/dropshipping/api.ts
export function getMarkupMultiplier(): number {
  return 3.0; // Changed from 2.5
}
```

**Example: Stricter Quality Filter**

```typescript
// src/lib/dropshipping/api.ts
function applyQualityFilter(products: Product[]): Product[] {
  return products.filter((product) => {
    return (
      product.rating >= 4.7 && // Changed from 4.5
      product.orders >= 500 && // Changed from 100
      product.shippingDays <= 10 // Changed from 15
    );
  });
}
```

### B. Changing How the AI Speaks (Personality)

**File**: `src/lib/prompts/search/writer.ts`

**Current Vibe**: "Concierge, luxury, efficient."

**To change personality**, edit the System Prompt string:

```typescript
// src/lib/prompts/search/writer.ts
const systemPrompt = `
You are a luxury shopping concierge for DesireFinder.
Your tone is: [CHANGE THIS]
- Professional yet warm
- Focused on quality over price
- Efficient and direct
- Slightly sassy (optional)

When presenting products:
1. Highlight unique features
2. Emphasize quality and craftsmanship
3. Be honest about limitations
4. Create desire through storytelling
`;
```

**Common Personality Tweaks**:
- **"Make it sassier"**: Add humor, wit, playful language
- **"Focus on technical specs"**: Emphasize dimensions, materials, specifications
- **"More luxury-focused"**: Emphasize exclusivity, craftsmanship, premium materials
- **"Casual and friendly"**: Use simpler language, be more conversational

### C. Changing Query Classification

**File**: `src/lib/agents/search/classifier.ts`

**What to modify**:
- When to skip search vs. perform search
- When to ask for clarification
- Diagnostic phase logic

**Example: Require Clarification for Queries < 3 Words**

```typescript
// src/lib/agents/search/classifier.ts
// In the classification prompt:
needsClarification: z
  .boolean()
  .describe('Set to true if query is less than 3 words and lacks specific details'),
```

---

## 3. Frontend & UI Updates

### A. Changing the "Look & Feel" (Tailwind)

#### Global Styles
**File**: `src/app/globals.css`

```css
/* Change global colors, fonts, spacing */
:root {
  --primary-color: #your-color;
  --font-family: 'Your Font', sans-serif;
}
```

#### Theme Configuration
**File**: `tailwind.config.ts`

```typescript
// Change colors, fonts, breakpoints
export default {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      },
      fontFamily: {
        sans: ['Your Font', 'sans-serif'],
      },
    },
  },
};
```

### B. Product Display (Conversion Optimization)

**File**: `src/components/ProductCard.tsx`

**This is the most critical file for conversion optimization.**

**What to modify**:
- Product image display
- Price formatting
- Buy button styling/placement
- Rating display
- Shipping information

**Example: Add "Limited Stock" Badge**

```typescript
// src/components/ProductCard.tsx
{product.orders < 50 && (
  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
    Limited Stock
  </span>
)}
```

### C. Chat Interface

**File**: `src/components/Chat.tsx`, `src/components/MessageBox.tsx`

**What to modify**:
- Message bubble styling
- Typing indicators
- Source citations display
- Product card integration

---

## 4. Deploying Updates to DigitalOcean

**Since you're using Docker Compose on a Droplet, you don't "push" to a platform like Vercel. You "pull" updates to your server.**

### The Update Cycle:

#### Step 1: Local Development
```bash
# Make your changes locally
# Test thoroughly

# Commit and push to GitHub
git add .
git commit -m "feat: added visual search filter"
git push origin main
```

#### Step 2: Server Deployment (DigitalOcean)

**SSH into your droplet**:
```bash
ssh root@your-droplet-ip
# or
ssh root@desirefinder.com
```

**Navigate to project**:
```bash
cd desirefinder
```

**Apply Changes**:
```bash
# 1. Get new code
git pull origin main

# 2. Rebuild the containers (CRUCIAL for Next.js changes)
docker-compose up -d --build

# 3. Apply DB changes (if any)
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma generate

# 4. Restart services (if needed)
docker-compose restart app
```

### ⚠️ Critical Notes:

1. **Always use `--build` flag**: Next.js changes require rebuilding the container
2. **Check logs after deploy**: `docker-compose logs -f app`
3. **Database changes**: Always run `prisma db push` and `prisma generate` after schema changes
4. **Nginx changes**: If you modify `nginx/conf.d/app.conf`, restart Nginx:
   ```bash
   docker-compose restart nginx
   docker-compose exec nginx nginx -t  # Test config
   ```

### Rollback Procedure:

If something breaks:

```bash
# 1. Revert to previous commit
git log  # Find previous commit hash
git checkout <previous-commit-hash>

# 2. Rebuild
docker-compose up -d --build

# 3. Restore database (if needed)
# Use your backup or revert Prisma migrations
```

---

## 5. Troubleshooting Common Issues

### Issue: "Prisma Client has no member..."

**Cause**: You changed `schema.prisma` but didn't regenerate types.

**Fix**:
```bash
npx prisma generate
```

**Prevention**: Always run `prisma generate` after schema changes.

---

### Issue: "Connection pool timeout"

**Cause**: Prisma is opening too many connections in development.

**Fix**: Ensure global Prisma singleton pattern is used:

```typescript
// src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Prevention**: Always use the singleton pattern. Never create multiple PrismaClient instances.

---

### Issue: "Images 403 Forbidden"

**Cause**: AliExpress hotlink protection blocking direct image access.

**Fix**: Ensure your Nginx config includes image proxy rules:

```nginx
# nginx/conf.d/app.conf
location /api/images/proxy {
    proxy_cache img_cache;
    proxy_cache_valid 200 7d;
    proxy_pass http://app;
    # ... other proxy settings
}
```

**Alternative**: Use Next.js Image Optimization (already configured in `next.config.mjs`):

```typescript
// next.config.mjs
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'ae01.alicdn.com' },
    { protocol: 'https', hostname: 'cbu01.alicdn.com' },
  ],
}
```

---

### Issue: "AI hallucinating products"

**Cause**: The `shoppingSearch.ts` failed but the Agent tried to "fill in the blanks."

**Fix**:
1. Check the API logs: `docker-compose logs app | grep dropshipping`
2. Verify API keys are set: `echo $DROPSHIPPING_API_KEY`
3. Check if API returned 0 results:
   ```typescript
   // src/lib/agents/search/researcher/actions/shoppingSearch.ts
   if (products.length === 0) {
     // Return explicit "no results" instead of letting AI make up products
     return { products: [], message: "No products found matching your criteria." };
   }
   ```

**Prevention**: Always handle empty results explicitly. Never let the AI generate fake products.

---

### Issue: "Rate limit 429 errors"

**Cause**: Nginx rate limiting is too strict, or you're testing too aggressively.

**Fix**: Temporarily increase rate limits for testing:

```nginx
# nginx/conf.d/app.conf
limit_req_zone $binary_remote_addr zone=ai_limit:10m rate=10r/m; # Changed from 5r/m
```

Then restart Nginx:
```bash
docker-compose restart nginx
```

**Production**: Keep strict limits (5 chats/minute) to protect AI credits.

---

### Issue: "Price validation always fails"

**Cause**: Dropshipping API is down or returning different data format.

**Fix**:
1. Check API status: `curl -H "X-RapidAPI-Key: $DROPSHIPPING_API_KEY" https://aliexpress-data.p.rapidapi.com/product/TEST_ID`
2. Check logs: `docker-compose logs app | grep "Price validation"`
3. Verify API response format matches expected structure

**Fallback**: The code already has a fallback - if price validation fails, it uses stored price (with warning log).

---

### Issue: "Docker build fails"

**Cause**: Missing dependencies or build errors.

**Fix**:
```bash
# Clean build
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Check logs**:
```bash
docker-compose logs app
```

---

## 6. Development Workflow Checklist

### Before Making Changes:
- [ ] Pull latest code: `git pull origin main`
- [ ] Check current branch: `git branch`
- [ ] Review recent changes: `git log --oneline -10`

### Making Changes:
- [ ] Make changes in appropriate files (see sections above)
- [ ] Test locally: `yarn dev`
- [ ] Run type check: `yarn type-check` (if available)
- [ ] Test database changes: `npx prisma db push && npx prisma generate`

### Before Deploying:
- [ ] Commit changes: `git add . && git commit -m "description"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Review changes: `git diff main`

### Deploying:
- [ ] SSH into droplet
- [ ] Pull code: `git pull origin main`
- [ ] Rebuild: `docker-compose up -d --build`
- [ ] Apply DB changes: `docker-compose exec app npx prisma db push`
- [ ] Check logs: `docker-compose logs -f app`
- [ ] Test in production: Visit your domain

### After Deploying:
- [ ] Monitor logs: `docker-compose logs -f app`
- [ ] Test critical paths (search, checkout, chat)
- [ ] Check error rates in logs
- [ ] Verify rate limiting works

---

## 7. Quick Reference Commands

### Database:
```bash
# Local development
npx prisma db push          # Sync schema to local DB
npx prisma generate         # Generate TypeScript types
npx prisma studio          # Open Prisma Studio (DB GUI)

# Production (on droplet)
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma generate
```

### Docker:
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f db

# Restart services
docker-compose restart app
docker-compose restart nginx

# Stop everything
docker-compose down

# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Git:
```bash
# Standard workflow
git add .
git commit -m "feat: description"
git push origin main

# Check status
git status
git log --oneline -10
git diff
```

### Nginx:
```bash
# Test config
docker-compose exec nginx nginx -t

# Reload config
docker-compose restart nginx

# View access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

---

## 8. File Change Matrix

| What You Want to Change | File to Edit | Command to Run |
|------------------------|--------------|----------------|
| Database schema | `prisma/schema.prisma` | `npx prisma db push && npx prisma generate` |
| AI search logic | `src/lib/agents/search/researcher/actions/shoppingSearch.ts` | `docker-compose up -d --build` |
| AI personality | `src/lib/prompts/search/writer.ts` | `docker-compose up -d --build` |
| Product display | `src/components/ProductCard.tsx` | `docker-compose up -d --build` |
| Global styles | `src/app/globals.css` | `docker-compose up -d --build` |
| Theme colors | `tailwind.config.ts` | `docker-compose up -d --build` |
| Rate limiting | `nginx/conf.d/app.conf` | `docker-compose restart nginx` |
| Environment vars | `.env.production` | `docker-compose restart app` |

---

## 🎯 Summary

**Key Principles**:
1. **Database changes** → Always use Prisma (never Drizzle)
2. **AI logic** → Agents for behavior, Prompts for personality
3. **Deployment** → Pull to server, rebuild containers
4. **Always test locally** before deploying
5. **Check logs** after every deployment

**Remember**: This is a production system. Changes affect real users and revenue. Test thoroughly, deploy carefully, monitor closely.

---

**Questions?** Check the troubleshooting section or review the deployment documentation in `DIGITALOCEAN_DROPLET_DEPLOYMENT.md`.
