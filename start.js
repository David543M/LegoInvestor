// Script de démarrage personnalisé pour Render
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

console.log('🔍 Vérification de l\'environnement de déploiement');
console.log(`📂 Répertoire courant: ${process.cwd()}`);

// Liste des fichiers
try {
  console.log('📑 Liste des fichiers dans le répertoire courant:');
  const output = execSync('ls -la', { encoding: 'utf8' });
  console.log(output);
} catch (error) {
  console.error('❌ Erreur lors de la liste des fichiers:', error);
}

// Vérifier si le dossier dist existe
const distPath = path.join(process.cwd(), 'dist');
const distExists = fs.existsSync(distPath);
console.log(`${distExists ? '✅' : '❌'} Le dossier "dist" existe${distExists ? '' : ' pas'}`);

if (distExists) {
  // Liste des fichiers dans dist
  try {
    console.log('📑 Liste des fichiers dans dist:');
    const output = execSync('ls -la dist', { encoding: 'utf8' });
    console.log(output);
  } catch (error) {
    console.error('❌ Erreur lors de la liste des fichiers dans dist:', error);
  }
  
  // Vérifie si le fichier server/index.js existe
  const serverIndexPath = path.join(distPath, 'server', 'index.js');
  const serverIndexExists = fs.existsSync(serverIndexPath);
  console.log(`${serverIndexExists ? '✅' : '❌'} Le fichier "dist/server/index.js" existe${serverIndexExists ? '' : ' pas'}`);
  
  // Chercher d'autres emplacements possibles pour le fichier index.js
  if (!serverIndexExists) {
    // Chercher directement dans dist
    const directIndexPath = path.join(distPath, 'index.js');
    const directIndexExists = fs.existsSync(directIndexPath);
    if (directIndexExists) {
      console.log(`✅ Fichier trouvé à "dist/index.js" - Utilisation de ce fichier`);
      try {
        require(directIndexPath);
        process.exit(0);
      } catch (error) {
        console.error(`❌ Erreur lors de l'exécution de dist/index.js:`, error);
      }
    } else {
      // Recherche globale de index.js dans le dist
      try {
        console.log('🔍 Recherche de tous les fichiers index.js dans dist:');
        const findOutput = execSync('find dist -name "index.js"', { encoding: 'utf8' });
        console.log(findOutput);
        
        const indexFiles = findOutput.trim().split('\n').filter(f => f);
        if (indexFiles.length > 0) {
          console.log(`✅ Fichier index.js trouvé à "${indexFiles[0]}" - Utilisation de ce fichier`);
          try {
            require(path.join(process.cwd(), indexFiles[0]));
            process.exit(0);
          } catch (error) {
            console.error(`❌ Erreur lors de l'exécution de ${indexFiles[0]}:`, error);
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la recherche de index.js:', error);
      }
    }
  } else {
    // Le fichier server/index.js existe, l'exécuter
    try {
      require(serverIndexPath);
      process.exit(0);
    } catch (error) {
      console.error(`❌ Erreur lors de l'exécution de dist/server/index.js:`, error);
    }
  }
}

// Si on arrive ici, c'est qu'aucun fichier n'a été trouvé ou n'a pu être exécuté
console.error('❌ Impossible de trouver ou d\'exécuter le fichier index.js');
process.exit(1); 