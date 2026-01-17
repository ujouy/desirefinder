# PowerShell script to upload only essential files to droplet
# Excludes node_modules, .next, .git, and other large directories

$DROPLET_IP = "165.232.140.104"
$REMOTE_PATH = "/root/desirefinder"

Write-Host "📤 Uploading essential files to droplet..." -ForegroundColor Cyan

# Essential files to upload
$files = @(
    "docker-compose.production.yml",
    "Dockerfile.slim",
    "package.json",
    "package-lock.json",
    "next.config.mjs",
    "tsconfig.json",
    "tailwind.config.ts",
    "postcss.config.js",
    ".env"
)

# Essential directories to upload
$dirs = @(
    "src",
    "public",
    "prisma",
    "searxng"
)

# Upload files
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Uploading $file..." -ForegroundColor Yellow
        scp -o StrictHostKeyChecking=no $file "root@${DROPLET_IP}:${REMOTE_PATH}/"
    }
}

# Upload directories
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Write-Host "Uploading $dir/..." -ForegroundColor Yellow
        scp -r -o StrictHostKeyChecking=no $dir "root@${DROPLET_IP}:${REMOTE_PATH}/"
    }
}

Write-Host "✅ Upload complete!" -ForegroundColor Green
Write-Host "Now SSH into your droplet and run:" -ForegroundColor Cyan
Write-Host "  cd /root/desirefinder"
Write-Host "  docker compose -f docker-compose.production.yml up -d"
