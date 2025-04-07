import { InsertLegoDeal, InsertLegoSet } from '../../shared/schema.js';
import { storage } from '../storage.js';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

export async function scrapeDealabs(): Promise<InsertLegoDeal[]> {
  const deals: InsertLegoDeal[] = [];
  
  try {
    console.log("Fetching LEGO deals from Dealabs...");
    
    // Simuler un navigateur avec les headers
    const response = await fetch("https://www.dealabs.com/search?q=lego&category_id=9", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Dealabs page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extraire les deals avec Cheerio
    console.log("Extracting deals with Cheerio...");
    const items = $('article, .thread').map((i, element) => {
      const $element = $(element);
      const title = $element.find('h2, .thread-title, .thread-link').text().trim();
      const priceText = $element.find('.thread-price, .price').text().trim();
      
      // Utiliser les sélecteurs spécifiques pour le prix initial et la réduction
      const originalPriceText = $element.find('span[class*="text--strikethrough"]').text().trim();
      const discountText = $element.find('.textBadge--green').text().trim();
      
      const url = $element.find('a[href*="dealabs.com"]').attr('href') || '';
      const imageUrl = $element.find('img').attr('src') || 'https://placeholder.com/lego.png';
      const isAvailable = !$element.find('.expired, .unavailable').length;
      
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
    }).get();

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