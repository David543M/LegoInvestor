import puppeteer from 'puppeteer';
import { InsertLegoDeal } from '@shared/schema';

export async function scrapeAvenueDeLaBrique(): Promise<InsertLegoDeal[]> {
  console.log("Navigating to Avenue de la Brique...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
    await page.setViewport({ width: 1280, height: 800 });

    // Naviguer vers la page des bons plans LEGO
    await page.goto('https://www.avenuedelabrique.com/lego', {
      waitUntil: 'networkidle2',
      timeout: 90000
    });

    // Wait for the product grid to load
    await page.waitForSelector('.product-grid, .product-list, .product-item', {
      timeout: 90000
    });

    const deals: InsertLegoDeal[] = [];

    // Extraire les informations de chaque produit
    const products = await page.$$(".product-list .product");
    console.log(`Found ${products.length} products`);

    for (const product of products) {
      try {
        const title = await product.$eval(".product-title", el => el.textContent?.trim() || "");
        const priceText = await product.$eval(".current-price", el => el.textContent?.trim() || "");
        const originalPriceText = await product.$eval(".regular-price", el => el.textContent?.trim() || "");
        const url = await product.$eval("a.product-link", el => el.href);

        // Extraire le numéro de set du titre
        const setNumberMatch = title.match(/(\d{4,5})/);
        const setId = setNumberMatch ? setNumberMatch[1] : "";

        // Convertir les prix en nombres
        const currentPrice = parseFloat(priceText.replace(/[^\d,]/g, "").replace(",", "."));
        const originalPrice = parseFloat(originalPriceText.replace(/[^\d,]/g, "").replace(",", ".")) || currentPrice;

        if (setId && !isNaN(currentPrice)) {
          const discountPercentage = originalPrice > currentPrice ? 
            ((originalPrice - currentPrice) / originalPrice) * 100 : 0;

          deals.push({
            setId,
            source: "Avenue de la Brique",
            currentPrice,
            originalPrice,
            discountPercentage,
            url,
            isAvailable: true,
            isProfitable: discountPercentage > 20,
            profitAmount: originalPrice - currentPrice
          });
        }
      } catch (error) {
        console.error("Error extracting product details:", error);
      }
    }

    console.log(`✅ Found ${deals.length} LEGO deals on Avenue de la Brique`);
    return deals;
  } catch (error) {
    console.error("Error scraping Avenue de la Brique:", error);
    return [];
  } finally {
    await browser.close();
  }
} 