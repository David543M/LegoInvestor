#!/usr/bin/env bash
# Script d'installation pour Render.com

# Mise à jour des paquets
apt-get update
apt-get install -y chromium-browser

# Configuration de Puppeteer pour utiliser Chromium installé
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

echo "Environnement Puppeteer configuré!" 