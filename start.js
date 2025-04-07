// Script de démarrage personnalisé pour Render
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Vérification de l\'environnement de déploiement');
console.log(`📂 Répertoire courant: ${process.cwd()}`);
console.log('📑 Liste des fichiers dans le répertoire courant:');
console.log(execSync('ls -la').toString());

// Vérifier si le dossier dist existe
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ Le dossier "dist" existe');
  console.log('📑 Liste des fichiers dans dist:');
  console.log(execSync(`ls -la ${distPath}`).toString());

  // Vérifier si le dossier dist/server existe
  const serverDistPath = path.join(distPath, 'server');
  if (fs.existsSync(serverDistPath)) {
    console.log('✅ Le dossier "dist/server" existe');
    console.log('📑 Liste des fichiers dans dist/server:');
    console.log(execSync(`ls -la ${serverDistPath}`).toString());

    // Vérifier si le fichier index.js existe
    const indexPath = path.join(serverDistPath, 'index.js');
    if (fs.existsSync(indexPath)) {
      console.log('✅ Le fichier "dist/server/index.js" existe');
      console.log('🚀 Démarrage du serveur...');
      
      try {
        // Utilisation de spawn pour exécuter le serveur
        console.log(execSync(`node ${indexPath}`).toString());
      } catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
        process.exit(1);
      }
    } else {
      console.error('❌ Le fichier "dist/server/index.js" n\'existe pas');
      process.exit(1);
    }
  } else {
    console.error('❌ Le dossier "dist/server" n\'existe pas');
    process.exit(1);
  }
} else {
  console.error('❌ Le dossier "dist" n\'existe pas');
  process.exit(1);
} 