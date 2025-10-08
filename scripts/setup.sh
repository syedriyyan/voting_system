#!/bin/bash

# Exit on error
set -e

echo "Setting up SecureVote development environment..."

# Install pnpm if not installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
cd apps/api
pnpm prisma generate
cd ../..

# Build packages
echo "Building packages..."
pnpm build

# Setup environment variables
echo "Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Start development environment
echo "Starting development environment..."
pnpm dev