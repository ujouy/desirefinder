#!/bin/bash
# Script to download required Ollama models for DesireFinder
# Run this after your Docker stack is up

echo "🚀 Setting up Ollama models for DesireFinder..."

# Check if Ollama container is running
if ! docker ps | grep -q ollama; then
    echo "❌ Error: Ollama container is not running!"
    echo "   Start it with: docker compose -f docker-compose.production.yml up -d ollama"
    exit 1
fi

echo "📥 Downloading uncensored chat model: dolphin-llama3"
docker exec -it ollama ollama pull dolphin-llama3

if [ $? -eq 0 ]; then
    echo "✅ dolphin-llama3 downloaded successfully"
else
    echo "⚠️  Warning: dolphin-llama3 download failed, trying alternative..."
    echo "📥 Downloading alternative: mistral-nemo"
    docker exec -it ollama ollama pull mistral-nemo
fi

echo "📥 Downloading embedding model: nomic-embed-text"
docker exec -it ollama ollama pull nomic-embed-text

if [ $? -eq 0 ]; then
    echo "✅ nomic-embed-text downloaded successfully"
else
    echo "❌ Error: Failed to download nomic-embed-text"
    exit 1
fi

echo ""
echo "📋 Listing installed models:"
docker exec -it ollama ollama list

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open DesireFinder at http://localhost:3000"
echo "2. Go to Settings → Models"
echo "3. Configure Ollama provider:"
echo "   - API URL: http://ollama:11434"
echo "   - Chat Model: dolphin-llama3 (or mistral-nemo)"
echo "   - Embedding Model: nomic-embed-text"
