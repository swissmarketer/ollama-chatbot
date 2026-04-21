#!/bin/bash
set -e

echo "Starting Ollama server..."
ollama serve &

echo "Waiting for Ollama to be ready..."
sleep 5

echo "Pulling model: $OLLAMA_MODEL"
ollama pull $OLLAMA_MODEL

echo "Model $OLLAMA_MODEL ready!"
echo "Ollama is running on port 11434"

wait