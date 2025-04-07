/**
 * Script pour configurer l'environnement de déploiement sur Render
 */
console.log('Setting up environment for Render deployment...');

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Vérifier si nous sommes sur Render
const isRender = process.env.RENDER === 'true';

if (isRender) {
  console.log('Running on Render, setting up Chrome...');
  
  try {
    // Essayer d'installer Chrome si nécessaire
    if (process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD !== 'true') {
      console.log('Installing puppeteer with Chrome...');
      execSync('npm install puppeteer --no-save');
    } else {
      console.log('Skipping Chrome download as PUPPETEER_SKIP_CHROMIUM_DOWNLOAD is set');
    }
    
    // Vérifier si Chrome est disponible
    try {
      const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable';
      
      if (fs.existsSync(chromePath)) {
        console.log(`Chrome found at ${chromePath}`);
        // Tester Chrome
        const version = execSync(`${chromePath} --version`).toString().trim();
        console.log(`Chrome version: ${version}`);
      } else {
        console.warn(`Chrome not found at ${chromePath}`);
        // Essayer de trouver Chrome ailleurs
        try {
          const whichChrome = execSync('which google-chrome').toString().trim();
          console.log(`Found Chrome at: ${whichChrome}`);
          process.env.PUPPETEER_EXECUTABLE_PATH = whichChrome;
        } catch (error) {
          console.warn('Could not find Chrome with which command');
        }
      }
    } catch (error) {
      console.warn('Error checking Chrome:', error.message);
    }
  } catch (error) {
    console.error('Error setting up Chrome:', error.message);
  }
  
  console.log('Render setup completed');
} else {
  console.log('Not running on Render, skipping setup steps');
}

console.log('Setup script completed successfully'); 