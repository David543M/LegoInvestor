import axios from 'axios';
import { InsertLegoDeal, InsertLegoSet } from '../../shared/schema.js';
import { storage } from '../storage.js';

// Fonction pour extraire le numéro de set LEGO à partir du titre
function extractLegoSetNumber(title: string): string | null {
  // Recherche de patterns comme "LEGO 75192" ou "LEGO® 75192" ou "75192"
  const setNumberRegex = /(?:LEGO|LEGO®)?\s*(\d{4,6})(?:\s|$|,|-)/i;
  const match = title.match(setNumberRegex);
  return match ? match[1] : null;
}

/**
 * Scraper Dealabs simplifié utilisant l'API au lieu de Puppeteer
 * Cette version est compatible avec les environnements sans Chrome
 */
export async function scrapeDealabsApi(): Promise<InsertLegoDeal[]> {
  console.log("Scraping Dealabs using API method...");
  try {
    // URL de l'API Dealabs pour les deals LEGO (recherche "lego")
    const url = 'https://www.dealabs.com/api/v2/threadgroups?include=deal&visibility=everyone&sort=hot&query=lego&limit=30';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.dealabs.com/search?q=lego'
      }
    });

    const deals = response.data.data || [];
    
    console.log(`Found ${deals.length} potential LEGO deals from Dealabs API`);
    
    const legoDeals: InsertLegoDeal[] = [];
    
    for (const deal of deals) {
      try {
        const title = deal.title || '';
        // Vérifier si c'est un deal LEGO
        if (!title.toLowerCase().includes('lego')) continue;
        
        // Extraire le prix actuel
        const currentPrice = parseFloat(deal.price?.value || '0');
        if (!currentPrice) continue;
        
        // Extraire le prix original
        const originalPrice = parseFloat(deal.price?.oldValue || String(currentPrice));
        
        // Calculer le pourcentage de réduction
        const discountPercentage = originalPrice > 0 
          ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
          : 0;
        
        // Ignorer les deals sans réduction
        if (discountPercentage <= 0) continue;
        
        // Extraire le numéro de set LEGO
        const setNumber = extractLegoSetNumber(title);
        if (!setNumber) {
          console.log(`  ⚠️ No LEGO set number found in: "${title}"`);
          continue;
        }
        
        // URL du deal
        const dealUrl = `https://www.dealabs.com${deal.url}`;
        
        // Log du deal trouvé
        console.log(`  ✅ Found LEGO deal: ${title} - ${currentPrice}€ (${discountPercentage}% off) - Set #${setNumber}`);
        
        // Vérifier si le set LEGO existe déjà, sinon le créer
        let legoSet = await storage.getLegoSetBySetNumber(setNumber);
        
        if (!legoSet) {
          const newSet: InsertLegoSet = {
            setNumber,
            name: title.replace(/lego|lego®/i, '').trim(),
            theme: "Unknown",
            retailPrice: originalPrice,
            imageUrl: "https://placeholder.com/lego.png", // Valeur par défaut
            pieceCount: 0,
            yearReleased: new Date().getFullYear(),
            avgRating: 0,
            numReviews: 0
          };
          
          legoSet = await storage.createLegoSet(newSet);
          console.log(`  📦 Created new LEGO set: ${setNumber}`);
        }
        
        const legoDeal: InsertLegoDeal = {
          setId: setNumber,
          source: "Dealabs",
          currentPrice,
          originalPrice,
          discountPercentage,
          url: dealUrl,
          lastChecked: new Date()
        };
        
        legoDeals.push(legoDeal);
      } catch (error) {
        console.error(`  ❌ Error processing deal: ${error}`);
      }
    }
    
    console.log(`✅ Found ${legoDeals.length} valid LEGO deals on Dealabs`);
    return legoDeals;
  } catch (error) {
    console.error(`Error scraping Dealabs API: ${error}`);
    return [];
  }
} 