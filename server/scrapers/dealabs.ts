import puppeteer, { type Page } from "puppeteer";
import { type LegoDeal } from "../../shared/schema.js";
import { extractLegoSetNumber } from "./utils.js";

export async function scrapeDealabs(): Promise<LegoDeal[]> {
  console.log("Lancement du navigateur pour Dealabs...");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920x1080",
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });

  try {
    console.log("Configuration du navigateur...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setExtraHTTPHeaders({
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      "Accept-Encoding": "gzip, deflate, br",
    });

    console.log("Navigation vers Dealabs...");
    await page.goto("https://www.dealabs.com/search?q=lego", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Attendre que la page soit complètement chargée
    await page.waitForFunction(() => {
      return document.readyState === "complete";
    }, { timeout: 60000 });

    console.log("Attente du chargement des deals...");
    try {
      await page.waitForSelector(".threadGrid", { timeout: 60000 });
    } catch (error) {
      console.log("Erreur lors de l'attente du sélecteur principal, tentative avec un sélecteur alternatif...");
      try {
        await page.waitForSelector(".thread", { timeout: 30000 });
      } catch (error) {
        console.log("Erreur avec le sélecteur alternatif, tentative avec un autre sélecteur...");
        await page.waitForSelector("article", { timeout: 30000 });
      }
    }

    // Faire défiler la page pour charger plus de deals
    console.log("Chargement de plus de deals...");
    await autoScroll(page);

    console.log("Extraction des deals...");
    const deals = await page.evaluate(() => {
      const dealElements = document.querySelectorAll(".threadGrid .thread, .thread, article");
      return Array.from(dealElements).map((deal) => {
        const title = deal.querySelector(".thread-title, h2")?.textContent?.trim() || "";
        const priceText = deal.querySelector(".thread-price, .price")?.textContent?.trim() || "";
        const price = parseFloat(priceText.replace(/[^0-9,]/g, "").replace(",", "."));
        const originalPriceText = deal.querySelector(".thread-price--old, span[class*='text--strikethrough']")?.textContent?.trim() || "";
        const originalPrice = parseFloat(originalPriceText.replace(/[^0-9,]/g, "").replace(",", "."));
        const discountText = deal.querySelector(".thread-discount, .textBadge--green")?.textContent?.trim() || "";
        const discount = parseFloat(discountText.replace(/[^0-9]/g, ""));
        const url = deal.querySelector(".thread-title, h2 a")?.getAttribute("href") || "";
        const imageUrl = deal.querySelector(".thread-image img, img")?.getAttribute("src") || "";

        return {
          title,
          price,
          originalPrice,
          discount,
          url: url.startsWith("http") ? url : `https://www.dealabs.com${url}`,
          imageUrl,
        };
      });
    });

    console.log(`Nombre de deals trouvés : ${deals.length}`);

    await browser.close();
    console.log("Navigateur fermé");

    // Filtrer et transformer les deals en LegoDeal
    const legoDeals = deals
      .filter((deal) => {
        const setNumber = extractLegoSetNumber(deal.title);
        const isValid = setNumber !== null && !isNaN(deal.price) && deal.price > 0;
        if (!isValid) {
          console.log(`Deal ignoré : ${deal.title} (prix: ${deal.price}€)`);
        }
        return isValid;
      })
      .map((deal) => {
        const setNumber = extractLegoSetNumber(deal.title);
        console.log(`Deal LEGO trouvé : ${deal.title} - ${deal.price}€ (${deal.originalPrice}€) -${deal.discount}%`);
        return {
          setId: setNumber!,
          source: "Dealabs",
          currentPrice: deal.price,
          originalPrice: deal.originalPrice || deal.price,
          discountPercentage: deal.discount || Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100) || 0,
          url: deal.url,
          isAvailable: true,
          isProfitable: false,
          profitAmount: 0,
          lastChecked: new Date(),
          createdAt: new Date(),
        };
      });

    console.log(`Nombre de deals LEGO trouvés : ${legoDeals.length}`);
    return legoDeals;
  } catch (error) {
    console.error("Erreur lors du scraping de Dealabs :", error);
    await browser.close();
    return [];
  }
}

async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
} 