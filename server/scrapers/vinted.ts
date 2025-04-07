import { InsertLegoDeal } from '../../shared/schema.js';
import fetch from 'node-fetch';

interface VintedItem {
  id: string;
  title: string;
  price: number;
}

interface VintedResponse {
  items: VintedItem[];
}

// Fonction alternative pour scraper Vinted sans Puppeteer
export async function scrapeVinted(): Promise<InsertLegoDeal[]> {
  const deals: InsertLegoDeal[] = [];
  
  try {
    console.log("Scraping Vinted using direct API approach...");
    
    // Utiliser des headers génériques sans token
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
    
    // Essayer d'abord de récupérer la page HTML pour simuler un comportement de navigateur
    await fetch("https://www.vinted.fr/", {
      headers: {
        "User-Agent": headers["User-Agent"],
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      }
    });
    
    // Utiliser l'API publique de Vinted qui ne requiert pas de token pour des recherches de base
    console.log("Fetching LEGO items from Vinted public API...");
    const searchUrl = "https://www.vinted.fr/api/v2/catalog/items?search_text=lego&per_page=50&catalog[]=5&order=newest_first";
    
    const response = await fetch(searchUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Vinted data: ${response.status} ${response.statusText}`);
    }
    
    let data;
    try {
      data = await response.json() as VintedResponse;
    } catch (error) {
      console.error("Error parsing Vinted API response:", error);
      return [];
    }
    
    console.log("Processing Vinted items...");
    
    if (data?.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        const title = item.title || '';
        const price = item.price || 0;
        const url = `https://www.vinted.fr/items/${item.id}`;
        
        // Extract set number from title using more permissive regex
        const setNumberMatch = title.match(/(?:LEGO|lego|Lego)?\s*(?:set|Set|SET)?\s*#?\s*(\d{4,6})/i) || 
                              title.match(/(\d{4,6})\s*(?:LEGO|lego|Lego)/i);
        const setNumber = setNumberMatch ? setNumberMatch[1] : null;
        
        console.log(`Processing item: ${title} - ${price}€ - ${url} - Set number: ${setNumber}`);
        
        if (setNumber) {
          deals.push({
            setId: setNumber,
            source: 'Vinted',
            currentPrice: price,
            originalPrice: price, // Vinted doesn't show original price
            discountPercentage: 0,
            url,
            isAvailable: true,
            isProfitable: false, // Will be calculated later
            profitAmount: 0, // Will be calculated later
          });
        }
      }
    } else {
      console.warn("No items found in Vinted API response or invalid response format");
    }

    console.log(`✅ Found ${deals.length} LEGO deals on Vinted`);
    return deals;
  } catch (error) {
    console.error('Error scraping Vinted:', error);
    return [];
  }
} 