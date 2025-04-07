#!/bin/bash

# Build client
npm run build:client

# Build server
npm run build:server

# Create storage directory and copy env file
mkdir -p dist/server/storage
cp server/Database.env dist/server/storage/

# Install Chrome for Puppeteer
npx puppeteer browsers install chrome 