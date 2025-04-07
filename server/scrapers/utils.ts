/**
 * Extrait le numéro de set LEGO d'un titre
 * @param title Le titre à analyser
 * @returns Le numéro de set LEGO ou null si aucun numéro n'est trouvé
 */
export function extractLegoSetNumber(title: string): string | null {
  // Essayer plusieurs patterns pour extraire le numéro de set
  const patterns = [
    /(?:LEGO|lego|Lego)?\s*(?:set|Set|SET)?\s*#?\s*(\d{4,6})/i,
    /(\d{4,6})\s*(?:LEGO|lego|Lego)/i,
    /LEGO[^\d]*(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
} 