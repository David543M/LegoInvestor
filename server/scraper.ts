import { InsertLegoSet, InsertLegoDeal } from '../shared/schema.js';
import { storage } from './storage.js';
import { scrapeDealabs } from './scrapers/dealabs.js';
import { scrapeVinted } from './scrapers/vinted.js';
import { scrapeDealabsApi } from './scrapers/dealabs-api.js';

// This is a simplified scraper module that would normally use actual scraping libraries like Cheerio
// In a real implementation, this would connect to external websites and extract LEGO deal information

export async function scrapeLegoDeals(): Promise<InsertLegoDeal[]> {
  console.log("Scraping LEGO deals from Dealabs and Vinted");
  
  try {
    // Vérifier si nous sommes dans un environnement sans Chrome (comme Render)
    const isServerEnvironment = process.env.NODE_ENV === 'production' && process.env.RENDER === 'true';
    
    // Utiliser la méthode API pour Dealabs en production, sinon utiliser Puppeteer
    const dealabsPromise = isServerEnvironment 
      ? scrapeDealabsApi() 
      : scrapeDealabs().catch(error => {
          console.error(`Error scraping Dealabs: ${error}`);
          // Fallback à la méthode API si Puppeteer échoue
          return scrapeDealabsApi();
        });
    
    // Essayer de scraper Vinted, mais renvoyer un tableau vide en cas d'erreur
    const vintedPromise = scrapeVinted().catch(error => {
      console.error(`Error scraping Vinted: ${error}`);
      return [];
    });
    
    // Attendre que tous les scrapers se terminent
    const [dealabsDeals, vintedDeals] = await Promise.all([
      dealabsPromise,
      vintedPromise
    ]);
    
    // Combiner tous les résultats
    const allDeals = [...dealabsDeals, ...vintedDeals];
    
    console.log("Analyzing profitability of scraped LEGO deals");
    
    // Traiter chaque deal pour déterminer la rentabilité
    for (const deal of allDeals) {
      const legoSet = await storage.getLegoSetBySetNumber(deal.setId);
      
      if (legoSet && legoSet.retailPrice) {
        const retailPrice = legoSet.retailPrice;
        const currentPrice = deal.currentPrice;
        
        // Vérifier si le deal est disponible et rentable
        deal.isAvailable = true;
        deal.isProfitable = currentPrice < retailPrice;
        deal.profitAmount = deal.isProfitable ? retailPrice - currentPrice : 0;
      }
      
      try {
        await storage.createLegoDeal(deal);
      } catch (error) {
        console.error(`Failed to save deal for set ${deal.setId}: ${error}`);
      }
    }
    
    console.log("LEGO deal scraping completed successfully");
    return allDeals;
  } catch (error) {
    console.error(`Error during LEGO deal scraping: ${error}`);
    return [];
  }
}

// This function would be called on a schedule in a real implementation
export async function scheduleScrapingJobs() {
  console.log("Starting LEGO deal scraping...");
  
  try {
    await scrapeLegoDeals();
    
    // Calculer les statistiques
    const stats = await storage.getDealStats();
    console.log(`Deal stats: ${stats.totalDeals} total, ${stats.profitableDeals} profitable, ${stats.averageProfit.toFixed(2)}€ avg profit`);
    
    // Programmer la prochaine exécution (toutes les 3 heures)
    setTimeout(scheduleScrapingJobs, 3 * 60 * 60 * 1000);
    
  } catch (error) {
    console.error(`Error in scraping job: ${error}`);
    
    // En cas d'erreur, réessayer après 30 minutes
    setTimeout(scheduleScrapingJobs, 30 * 60 * 1000);
  }
}
