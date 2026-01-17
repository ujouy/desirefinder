# 📤 Upload Missing Files

The Docker build needs these additional files:

## Quick Upload Commands

**Run these in PowerShell on your local Windows machine:**

```powershell
cd D:\DesireFinder

# Upload missing config files
scp -o StrictHostKeyChecking=no drizzle.config.ts next-env.d.ts yarn.lock root@165.232.140.104:/root/desirefinder/

# Upload drizzle directory (required for migrations)
scp -r -o StrictHostKeyChecking=no drizzle root@165.232.140.104:/root/desirefinder/
```

## Then Deploy Again

**In your SSH session on the droplet:**

```bash
cd /root/desirefinder
docker compose -f docker-compose.production.yml up -d --build
```

## Files Needed

- ✅ `drizzle.config.ts` - Drizzle configuration
- ✅ `next-env.d.ts` - Next.js TypeScript definitions
- ✅ `yarn.lock` - Yarn lockfile (for consistent installs)
- ✅ `drizzle/` - Migration files (required for database setup)

These are all small files, so upload should be quick!
