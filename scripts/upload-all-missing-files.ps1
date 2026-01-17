# Upload all missing files to the droplet
# Run this from D:\DesireFinder in PowerShell

$dropletIP = "165.232.140.104"
$remotePath = "/root/desirefinder"

Write-Host "Uploading missing files to droplet..." -ForegroundColor Green

# Upload individual config files
Write-Host "Uploading config files..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no `
    postcss.config.js `
    drizzle.config.ts `
    next-env.d.ts `
    yarn.lock `
    root@${dropletIP}:${remotePath}/

# Upload drizzle directory
Write-Host "Uploading drizzle directory..." -ForegroundColor Yellow
scp -r -o StrictHostKeyChecking=no drizzle root@${dropletIP}:${remotePath}/

Write-Host "Upload complete! Now SSH into the droplet and run:" -ForegroundColor Green
Write-Host "  cd /root/desirefinder" -ForegroundColor Cyan
Write-Host "  docker compose -f docker-compose.production.yml up -d --build" -ForegroundColor Cyan
