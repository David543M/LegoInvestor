#!/bin/bash

# Build client
npm run build:client

# Build server
npm run build:server

# Create directories
mkdir -p /opt/render/project/src/dist/server/storage
mkdir -p /opt/render/project/src/dist/client

# Copy server files
cp -r dist/server/* /opt/render/project/src/dist/server/
cp server/Database.env /opt/render/project/src/dist/server/storage/

# Copy client files
cp -r dist/client/* /opt/render/project/src/dist/client/

# Install Chrome for Puppeteer
npx puppeteer browsers install chrome 