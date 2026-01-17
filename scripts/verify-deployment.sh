#!/bin/bash
# Verification script for DigitalOcean deployment
# Run this after starting the Docker stack

echo "🔍 Verifying DesireFinder Deployment..."
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    exit 1
fi

# Check all containers are running
echo "📦 Checking containers..."
containers=("desirefinder" "searxng" "ollama")
all_running=true

for container in "${containers[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "  ✅ $container is running"
    else
        echo "  ❌ $container is NOT running"
        all_running=false
    fi
done

if [ "$all_running" = false ]; then
    echo ""
    echo "⚠️  Some containers are not running. Check logs:"
    echo "   docker compose -f docker-compose.production.yml logs"
    exit 1
fi

echo ""
echo "🌐 Checking service endpoints..."

# Check DesireFinder
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✅ DesireFinder responding on port 3000"
else
    echo "  ❌ DesireFinder not responding on port 3000"
fi

# Check SearXNG
if curl -s "http://localhost:8080/search?q=test&format=json" > /dev/null 2>&1; then
    echo "  ✅ SearXNG responding on port 8080"
    
    # Check SafeSearch
    response=$(curl -s "http://localhost:8080/search?q=test&format=json")
    if echo "$response" | grep -q "results"; then
        echo "  ✅ SearXNG returning results"
    else
        echo "  ⚠️  SearXNG may have SafeSearch enabled (check settings.yml)"
    fi
else
    echo "  ❌ SearXNG not responding on port 8080"
fi

# Check Ollama
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "  ✅ Ollama responding on port 11434"
    
    # Check models
    models=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    if echo "$models" | grep -q "dolphin-llama3\|mistral-nemo\|nomic-embed-text"; then
        echo "  ✅ Ollama has models installed"
        echo "     Installed: $(echo "$models" | tr '\n' ' ')"
    else
        echo "  ⚠️  Ollama models not found. Run:"
        echo "     docker exec -it ollama ollama pull dolphin-llama3"
        echo "     docker exec -it ollama ollama pull nomic-embed-text"
    fi
else
    echo "  ❌ Ollama not responding on port 11434"
fi

echo ""
echo "🔗 Checking Docker network..."

if docker network inspect desirefinder-network > /dev/null 2>&1; then
    echo "  ✅ desirefinder-network exists"
    
    # Check containers are on network
    for container in "${containers[@]}"; do
        if docker network inspect desirefinder-network | grep -q "$container"; then
            echo "  ✅ $container is on network"
        else
            echo "  ⚠️  $container may not be on network"
        fi
    done
else
    echo "  ❌ desirefinder-network not found"
fi

echo ""
echo "💾 Checking volumes..."

volumes=("desirefinder-data" "desirefinder-uploads" "searxng-data" "ollama-data")
for volume in "${volumes[@]}"; do
    if docker volume ls --format '{{.Name}}' | grep -q "^${volume}$"; then
        echo "  ✅ $volume volume exists"
    else
        echo "  ⚠️  $volume volume not found (will be created on first run)"
    fi
done

echo ""
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Open http://your-droplet-ip:3000"
echo "2. Complete setup wizard"
echo "3. Configure Ollama in Settings → Models"
echo "4. Set system instructions for uncensored mode"
echo "5. Enable 'Adult / Tube' source and test"
