import puppeteer from 'puppeteer';
import { InsertLegoDeal, InsertLegoSet } from '../../shared/schema';
import { storage } from '../storage';
import * as cheerio from 'cheerio';

export async function scrapeDealabs(): Promise<InsertLegoDeal[]> {
  const deals: InsertLegoDeal[] = [];
  
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set headers to mimic a real browser
    await page.setExtraHTTPHeaders({
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5"
    });

    // Navigate to LEGO deals page
    console.log("Navigating to Dealabs...");
    await page.goto("https://www.dealabs.com/search?q=lego&category_id=9", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // Wait for deals to load
    console.log("Waiting for deals to load...");
    try {
      await page.waitForSelector('article', { timeout: 60000 });
    } catch (error) {
      console.log("Timeout waiting for articles, trying alternative selector...");
      await page.waitForSelector('.thread', { timeout: 60000 });
    }

    // Extract deals
    console.log("Extracting deals...");
    const items = await page.evaluate(() => {
      const elements = document.querySelectorAll('article, .thread');
      return Array.from(elements).map(element => {
        const title = element.querySelector('h2, .thread-title, .thread-link')?.textContent?.trim() || '';
        const priceText = element.querySelector('.thread-price, .price')?.textContent?.trim() || '';
        
        // Utiliser les sélecteurs spécifiques pour le prix initial et la réduction
        const originalPriceText = element.querySelector('span[class*="text--strikethrough"]')?.textContent?.trim() || '';
        const discountText = element.querySelector('.textBadge--green')?.textContent?.trim() || '';
        
        const url = element.querySelector('a[href*="dealabs.com"]')?.getAttribute('href') || '';
        const imageUrl = element.querySelector('img')?.getAttribute('src') || 'https://placeholder.com/lego.png';
        const isAvailable = !element.querySelector('.expired, .unavailable');
        
        // Extract set number from title
        const setNumberMatch = title.match(/LEGO[^\d]*(\d+)/i);
        const setNumber = setNumberMatch ? setNumberMatch[1] : null;
        
        console.log(`Processing deal: ${title}`);
        console.log(`- Current price: ${priceText}`);
        console.log(`- Original price: ${originalPriceText}`);
        console.log(`- Discount: ${discountText}`);
        
        return {
          title,
          priceText,
          originalPriceText,
          discountText,
          url,
          imageUrl,
          isAvailable,
          setNumber
        };
      });
    });

    await browser.close();

    // Process the scraped items
    for (const item of items) {
      if (item.setNumber && item.priceText) {
        const currentPrice = parseFloat(item.priceText.replace(/[^0-9.,]/g, '').replace(',', '.'));
        let originalPrice = currentPrice;
        let discountPercentage = 0;

        // Try to get original price from strikethrough text
        if (item.originalPriceText) {
          originalPrice = parseFloat(item.originalPriceText.replace(/[^0-9.,]/g, '').replace(',', '.'));
        }

        // Try to get discount percentage from badge
        if (item.discountText) {
          const discountMatch = item.discountText.match(/(-?\d+(?:\.\d+)?)/);
          if (discountMatch) {
            discountPercentage = Math.abs(parseFloat(discountMatch[1]));
            // If we have discount but no original price, calculate it
            if (!item.originalPriceText && discountPercentage > 0) {
              originalPrice = currentPrice / (1 - discountPercentage / 100);
            }
          }
        } else if (originalPrice > currentPrice) {
          // Calculate discount percentage if we have original price but no badge
          discountPercentage = ((originalPrice - currentPrice) / originalPrice) * 100;
        }
        
        if (!isNaN(currentPrice) && !isNaN(originalPrice)) {
          // Create or get the LEGO set first
          let legoSet = await storage.getLegoSetBySetNumber(item.setNumber);
          if (!legoSet) {
            const newSet: InsertLegoSet = {
              setNumber: item.setNumber,
              name: item.title,
              theme: "Unknown",
              retailPrice: originalPrice,
              imageUrl: item.imageUrl,
              pieceCount: 0,
              yearReleased: new Date().getFullYear(),
              avgRating: 0,
              numReviews: 0
            };
            legoSet = await storage.createLegoSet(newSet);
          }

          // Now create the deal with the LEGO set's ID
          deals.push({
            setId: legoSet.id.toString(),
            source: 'Dealabs',
            currentPrice,
            originalPrice,
            discountPercentage: Math.round(discountPercentage * 10) / 10, // Round to 1 decimal
            url: item.url || '',
            isAvailable: !!item.isAvailable,
            isProfitable: false, // Will be calculated later
            profitAmount: 0, // Will be calculated later
          });
        }
      }
    }

    console.log(`✅ Found ${deals.length} LEGO deals on Dealabs`);
    return deals;
  } catch (error) {
    console.error('Error scraping Dealabs:', error);
    return [];
  }
} 