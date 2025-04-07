import puppeteer from 'puppeteer';
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

async function getVintedAccessToken(): Promise<string> {
  console.log("📡 Getting Vinted access token...");
  
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.goto("https://www.vinted.fr/", { 
    waitUntil: "networkidle2",
    timeout: 60000 // Augmenter le timeout à 60 secondes
  });
  const cookies = await page.cookies();
  await browser.close();

  const accessTokenCookie = cookies.find(cookie => cookie.name === "access_token_web");
  if (!accessTokenCookie) {
    throw new Error("❌ Could not get access_token_web cookie");
  }

  console.log("✅ Got Vinted access token");
  return accessTokenCookie.value;
}

export async function scrapeVinted(): Promise<InsertLegoDeal[]> {
  const deals: InsertLegoDeal[] = [];
  
  try {
    const accessToken = await getVintedAccessToken();

    // Make API request to Vinted
    console.log("Making API request to Vinted...");
    const response = await fetch("https://www.vinted.fr/api/v2/catalog/items?search_text=lego&catalog[]=5&order=newest_first", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    const data = await response.json() as VintedResponse;
    console.log("Processing API response...");

    if (data?.items) {
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
    }

    console.log(`✅ Found ${deals.length} LEGO deals on Vinted`);
    return deals;
  } catch (error) {
    console.error('Error scraping Vinted:', error);
    return [];
  }
} 