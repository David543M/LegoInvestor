// Script pour ajouter l'extension .js aux imports relatifs
const fs = require('fs');
const path = require('path');

// Dossiers à parcourir
const directories = ['server', 'shared', 'api'];

// Extension à ajouter
const targetExtension = '.js';

// Fonction pour corriger les imports dans un fichier
function fixImportsInFile(filePath) {
  if (!filePath.endsWith('.ts') || filePath.endsWith('.d.ts')) return;
  
  console.log(`Examining: ${filePath}`);
  
  // Lire le contenu du fichier
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regex pour trouver les imports relatifs sans extension
  const importRegex = /from\s+['"]([\.\/][^'"]*)['"]/g;
  
  // Remplacer les imports relatifs sans extension
  const updatedContent = content.replace(importRegex, (match, importPath) => {
    // Ne pas modifier les imports qui ont déjà une extension
    if (path.extname(importPath) !== '') return match;
    
    // Ajouter .js à la fin du chemin d'importation
    return `from '${importPath}${targetExtension}'`;
  });
  
  // Écrire le contenu mis à jour dans le fichier
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Fonction pour parcourir un dossier de manière récursive
function processDirectory(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      processDirectory(itemPath);
    } else if (stats.isFile()) {
      fixImportsInFile(itemPath);
    }
  }
}

// Parcourir tous les dossiers
for (const directory of directories) {
  if (fs.existsSync(directory)) {
    processDirectory(directory);
  } else {
    console.log(`Directory not found: ${directory}`);
  }
}

console.log('Import fixes completed!'); 