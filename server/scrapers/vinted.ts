import { type LegoDeal } from "../../shared/schema.js";
import { extractLegoSetNumber } from "./utils.js";
import fetch from "node-fetch";

interface VintedItem {
  id: number;
  title: string;
  price: number;
  url: string;
  photo?: {
    url: string;
  };
}

interface VintedResponse {
  items: VintedItem[];
}

export async function scrapeVinted(): Promise<LegoDeal[]> {
  console.log("Récupération des deals Vinted via l'API...");
  
  try {
    const response = await fetch("https://www.vinted.fr/api/v2/catalog/items?search_text=lego&catalog[]=5&order=newest_first", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Encoding": "gzip, deflate, br",
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as VintedResponse;
    console.log(`Nombre d'items trouvés : ${data.items.length}`);

    // Filtrer et transformer les items en LegoDeal
    const deals = data.items
      .filter((item) => {
        const setNumber = extractLegoSetNumber(item.title);
        return setNumber !== null;
      })
      .map((item) => {
        const setNumber = extractLegoSetNumber(item.title);
        return {
          setId: setNumber!,
          source: "Vinted",
          currentPrice: item.price,
          originalPrice: item.price, // Vinted n'a pas de prix original
          discountPercentage: 0, // Vinted n'a pas de réduction
          url: item.url,
          isAvailable: true,
          isProfitable: false,
          profitAmount: 0,
          lastChecked: new Date(),
          createdAt: new Date(),
        };
      });

    console.log(`Nombre de deals LEGO trouvés : ${deals.length}`);
    return deals;
  } catch (error) {
    console.error("Erreur lors de la récupération des deals Vinted :", error);
    return [];
  }
} 