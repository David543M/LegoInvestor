import puppeteer from 'puppeteer';
import { InsertLegoDeal } from '../../shared/schema.js';
import fetch from 'node-fetch';

interface VintedItem {
  id: string;
  title: string;
  price: number;
  url: string;
}

async function scrapeVintedItems(): Promise<InsertLegoDeal[]> {
  console.log("📡 Scraping Vinted for LEGO items...");
  
  // Configuration compatible avec Render
  const options = process.env.NODE_ENV === 'production' ? {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    timeout: 60000
  } : {
    headless: true,
    timeout: 60000
  };
  
  try {
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    // Configuration du navigateur pour éviter la détection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });
    
    console.log("Navigating to Vinted...");
    await page.goto("https://www.vinted.fr/", { 
      waitUntil: "networkidle2",
      timeout: 60000
    });
    
    // Vérifier si nous pouvons directement scraper avec Puppeteer
    console.log("Trying to scrape Vinted directly with Puppeteer...");
    await page.goto("https://www.vinted.fr/catalog?search_text=lego", {
      waitUntil: "networkidle2",
      timeout: 60000
    });
    
    // Attendre que les articles se chargent
    try {
      await page.waitForSelector('[data-testid="item-box"]', { timeout: 30000 });
    } catch (error) {
      console.log("Timeout waiting for item-box, trying alternative selector...");
      await page.waitForSelector('.feed-grid', { timeout: 30000 });
    }
    
    // Récupérer les données directement
    const items = await page.evaluate(() => {
      const articles = document.querySelectorAll('[data-testid="item-box"]');
      return Array.from(articles).map(article => {
        const title = article.querySelector('h3')?.textContent?.trim() || '';
        const priceElement = article.querySelector('[data-testid="item-price"]');
        const priceText = priceElement?.textContent?.trim() || '';
        
        // Extraire l'URL et l'ID
        const linkElement = article.querySelector('a');
        const url = linkElement?.href || '';
        const id = url.split('/').pop() || '';
        
        return {
          id,
          title,
          price: parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.')),
          url
        };
      });
    });
    
    await browser.close();
    
    console.log(`Scraped ${items.length} items directly from Vinted`);
    
    // Analyser les résultats
    const deals: InsertLegoDeal[] = [];
    
    for (const item of items) {
      const title = item.title || '';
      const price = item.price || 0;
      const url = item.url || '';
      
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
    
    console.log(`✅ Found ${deals.length} LEGO deals on Vinted`);
    return deals;
  } catch (error) {
    console.error('Error scraping Vinted:', error);
    return [];
  }
}

export async function scrapeVinted(): Promise<InsertLegoDeal[]> {
  try {
    return await scrapeVintedItems();
  } catch (error) {
    console.error('Error in Vinted scraper:', error);
    return [];
  }
} 