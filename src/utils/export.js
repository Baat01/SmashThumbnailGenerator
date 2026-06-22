import html2canvas from 'html2canvas';

/**
 * Génère un PNG depuis un élément DOM et le télécharge.
 *
 * @param {HTMLElement} element - L'élément à capturer
 * @param {string} filename - Le nom du fichier (sans extension)
 * @param {object} options - Options html2canvas supplémentaires
 */
export async function exportElementAsPNG(element, filename = 'thumbnail', options = {}) {
  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false,
    scale: 2, // HD 2x pour les miniatures YouTube
    backgroundColor: null,
    logging: false,
    ...options,
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Génère des PNGs pour une liste de sets, en boucle.
 * Appelle onProgress(index, total) à chaque itération.
 *
 * @param {Array}    sets              - Les sets sélectionnés
 * @param {Function} getElementForSet  - (setId) => HTMLElement DOM reference
 * @param {Function} onProgress        - (current, total) => void
 * @param {number}   delayMs           - Délai entre chaque export (ms)
 */
export async function exportAllSets(sets, getElementForSet, onProgress, delayMs = 300) {
  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    const el = getElementForSet(set.id);
    if (!el) continue;

    const p1Tag = set.slots?.[0]?.entrant?.name ?? 'P1';
    const p2Tag = set.slots?.[1]?.entrant?.name ?? 'P2';
    const round = set.fullRoundText ?? `Round ${set.round}`;
    const filename = `${round} — ${p1Tag} vs ${p2Tag}`
      .replace(/[/\\?%*:|"<>]/g, '-'); // Nettoyage nom de fichier

    await exportElementAsPNG(el, filename);
    onProgress(i + 1, sets.length);

    // Petit délai pour éviter de saturer le navigateur
    if (i < sets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Convertit un File image en data URL (pour l'import de layout).
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
