/**
 * fabricRenderer.js
 *
 * Moteur de rendu Fabric.js basé sur le format JSON exporté par
 * SmashThumbnailGenerator (https://github.com/Kekwel/SmashThumbnailGenerator).
 *
 * Reconstruit fidèlement la miniature : backgrounds gradient, images de personnages,
 * bandeaux de tags tournés, texte de phase et VS.
 *
 * Compatible Fabric.js v5 (API sans setShadow, shadow assigné via .set()).
 * Les images GitHub utilisent un proxy CORS pour contourner les restrictions.
 */

import { fabric } from 'fabric';

// ─── Assets GitHub ─────────────────────────────────────────────────────────────
const ASSETS_BASE = 'https://raw.githubusercontent.com/Kekwel/ThumbnailGeneratorAssets/main/games/ult';

/**
 * Génère l'URL d'une image de personnage depuis son formatName.
 * @param {string} formatName  ex: "ylink", "isabelle", "fox"
 * @param {string} row         numéro de ligne (défaut "0")
 * @param {string} col         numéro de colonne (défaut "00")
 */
export function getCharacterImageUrl(formatName, row = '0', col = '00') {
  return `${ASSETS_BASE}/char/${formatName}_${row}_${String(col).padStart(2, '0')}.png`;
}

/**
 * Découpe un texte de round en deux parties pour les deux bandeaux.
 * "Winners Round 1" → ["Winners", "Round 1"]
 * "Grand Final"     → ["Grand",   "Final"]
 * "Winners"         → ["Winners", ""]
 */
export function splitRoundText(roundText) {
  if (!roundText) return ['', ''];
  const parts = roundText.trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], ''];
  return [parts[0], parts.slice(1).join(' ')];
}

// ─── Gradient ──────────────────────────────────────────────────────────────────

function buildGradientCoords(width, height, direction) {
  switch (direction) {
    case 'topright':    return { x1: 0,     y1: height, x2: width, y2: 0 };
    case 'bottomleft':  return { x1: width, y1: 0,      x2: 0,     y2: height };
    case 'bottomright': return { x1: 0,     y1: 0,      x2: width, y2: height };
    case 'topleft':     return { x1: width, y1: height, x2: 0,     y2: 0 };
    default:            return { x1: 0,     y1: 0,      x2: width, y2: 0 };
  }
}

function makeGradient(colors, width, height, direction) {
  const colorStops = colors.map((c, i) => ({
    offset: colors.length > 1 ? i / (colors.length - 1) : 0,
    color: c.hex,
  }));
  return new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: buildGradientCoords(width, height, direction),
    colorStops,
  });
}

// ─── Fond joueur ───────────────────────────────────────────────────────────────

export function drawBackground(canvas, bgData) {
  const { width, height, x, y, gradient, colorDirection } = bgData;
  const fill = makeGradient(gradient.colors, width, height, colorDirection);

  const rect = new fabric.Rect({
    left: x,
    top: y,
    width,
    height,
    fill,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top',
  });

  canvas.add(rect);
  return rect;
}

// ─── Image de personnage ───────────────────────────────────────────────────────

/**
 * Charge une image via un proxy CORS (allorigins.win) pour contourner
 * les restrictions de GitHub raw content.
 */
function proxiedUrl(url) {
  // Si c'est déjà un blob ou data URL, pas de proxy nécessaire
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  // Pour les URLs GitHub raw, on utilise un proxy CORS public
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
}

export function drawCharacter(canvas, charData, overrideUrl = null) {
  return new Promise((resolve) => {
    const rawUrl = overrideUrl || charData?.url;
    if (!rawUrl) { resolve(null); return; }

    const { x, y, width, height, flipX, angle, scale, shadow } = charData;

    // Tentative directe d'abord, puis avec proxy si ça échoue
    const tryLoad = (url, onFail) => {
      fabric.Image.fromURL(
        url,
        (img) => {
          if (!img || img.width === 0) {
            if (onFail) onFail();
            else resolve(null);
            return;
          }

          const imgWidth  = img.getOriginalSize?.()?.width  ?? img.width;
          const imgHeight = img.getOriginalSize?.()?.height ?? img.height;

          img.set({
            left:   x ?? 0,
            top:    y ?? 0,
            scaleX: ((width  ?? imgWidth)  / imgWidth)  * (scale?.x ?? 1),
            scaleY: ((height ?? imgHeight) / imgHeight) * (scale?.y ?? 1),
            flipX:  flipX ?? false,
            angle:  angle ?? 0,
            selectable: false,
            evented:    false,
            originX: 'left',
            originY: 'top',
          });

          // Fabric.js v5 : shadow via la propriété .shadow = new fabric.Shadow(...)
          if (shadow?.active) {
            img.set('shadow', new fabric.Shadow({
              color:   shadow.color   ?? '#000000',
              blur:    shadow.blur    ?? 10,
              offsetX: shadow.x       ?? 5,
              offsetY: shadow.y       ?? 5,
            }));
          }

          canvas.add(img);
          resolve(img);
        },
        { crossOrigin: 'anonymous' }
      );
    };

    // Essai direct, puis via proxy CORS si ça échoue
    tryLoad(rawUrl, () => tryLoad(proxiedUrl(rawUrl), null));
  });
}

// ─── Bandeau de tag (groupe rotatif) ───────────────────────────────────────────

export function drawTag(canvas, tagData, textOverride = null) {
  if (!tagData) return null;
  const { angle, text, bg } = tagData;
  const displayText = textOverride !== null ? textOverride : (text?.value ?? '');

  const bgWidth  = (bg?.width  ?? 400) * (bg?.scale?.x ?? 1);
  const bgHeight = (bg?.height ?? 60)  * (bg?.scale?.y ?? 1);
  const bgFill   = makeGradient(
    bg?.gradient?.colors ?? [{ hex: '#ffffff' }, { hex: '#ffffff' }],
    bgWidth, bgHeight,
    bg?.colorDirection
  );

  const bgRect = new fabric.Rect({
    left:   bg?.x ?? 0,
    top:    bg?.y ?? 0,
    width:  bg?.width  ?? 400,
    height: bg?.height ?? 60,
    scaleX: bg?.scale?.x ?? 1,
    scaleY: bg?.scale?.y ?? 1,
    fill:   bgFill,
    originX: 'left',
    originY: 'top',
  });

  const textObj = new fabric.Text(displayText, {
    left:       0,
    top:        0,
    fontSize:   text?.fontSize  ?? 40,
    fill:       text?.fill      ?? '#000000',
    fontFamily: text?.font      ?? 'Arial',
    fontWeight: text?.fontWeight ?? 'normal',
    fontStyle:  text?.fontStyle  ?? 'normal',
    originX: 'center',
    originY: 'center',
  });

  const group = new fabric.Group([bgRect, textObj], {
    left:    text?.x ?? 0,
    top:     text?.y ?? 0,
    angle:   angle   ?? 0,
    originX: text?.alignmentX === 'center' ? 'center' : 'left',
    originY: text?.alignmentY === 'middle' ? 'center' : 'top',
    selectable: false,
    evented:    false,
  });

  canvas.add(group);
  return group;
}

// ─── Texte VS ──────────────────────────────────────────────────────────────────

export function drawVS(canvas, vsData) {
  if (!vsData?.text) return null;
  const { text, shadow, angle } = vsData;

  const vsText = new fabric.Text(text.value ?? 'VS', {
    left:       text.x  ?? 640,
    top:        text.y  ?? 360,
    fontSize:   text.fontSize  ?? 99,
    fill:       text.fill      ?? '#ffffff',
    fontFamily: text.font      ?? 'Arial',
    fontWeight: text.fontWeight ?? 'bold',
    fontStyle:  text.fontStyle  ?? 'italic',
    originX: 'center',
    originY: 'center',
    angle:   angle ?? 0,
    selectable: false,
    evented:    false,
  });

  if (shadow) {
    vsText.set('shadow', new fabric.Shadow({
      color:   shadow.color   ?? '#000000',
      blur:    shadow.blur    ?? 0,
      offsetX: shadow.offsetX ?? 5,
      offsetY: shadow.offsetY ?? 5,
    }));
  }

  canvas.add(vsText);
  return vsText;
}

// ─── Images additionnelles ─────────────────────────────────────────────────────

export async function drawExtraImages(canvas, images = []) {
  for (const imgData of images) {
    if (!imgData?.url) continue;
    await new Promise((resolve) => {
      fabric.Image.fromURL(
        imgData.url,
        (img) => {
          if (!img || img.width === 0) { resolve(); return; }
          img.set({
            left:    imgData.x      ?? 0,
            top:     imgData.y      ?? 0,
            scaleX:  imgData.scaleX ?? 1,
            scaleY:  imgData.scaleY ?? 1,
            angle:   imgData.angle  ?? 0,
            opacity: imgData.opacity ?? 1,
            selectable: false,
            evented:    false,
          });
          canvas.add(img);
          resolve(img);
        },
        { crossOrigin: 'anonymous' }
      );
    });
  }
}

// ─── Fonction principale ────────────────────────────────────────────────────────

/**
 * Reconstruit entièrement le canvas Fabric.js à partir du template JSON
 * et des données d'un set Start.gg.
 *
 * @param {fabric.Canvas} canvas        Instance Fabric.js
 * @param {object}        template      JSON exporté par SmashThumbnailGenerator
 * @param {object}        set           Set Start.gg (slots, fullRoundText…)
 * @param {object}        charOverrides { p1CharUrl?, p2CharUrl? }
 */
export async function renderThumbnail(canvas, template, set, charOverrides = {}) {
  canvas.clear();
  canvas.setBackgroundColor('#111111', () => {});

  const p1Tag = set.slots?.[0]?.entrant?.participants?.[0]?.player?.gamerTag
             ?? set.slots?.[0]?.entrant?.name
             ?? 'P1';
  const p2Tag = set.slots?.[1]?.entrant?.participants?.[0]?.player?.gamerTag
             ?? set.slots?.[1]?.entrant?.name
             ?? 'P2';

  const roundText = set.fullRoundText ?? (set.round ? `Round ${set.round}` : '');
  const [phase1Text, phase2Text] = splitRoundText(roundText);

  // 1. Fonds
  if (template.j1?.bg) drawBackground(canvas, template.j1.bg);
  if (template.j2?.bg) drawBackground(canvas, template.j2.bg);

  // 2. Personnages (async)
  const p1Url = charOverrides.p1CharUrl || template.j1?.characters?.url || null;
  const p2Url = charOverrides.p2CharUrl || template.j2?.characters?.url || null;

  if (template.j1?.characters) await drawCharacter(canvas, template.j1.characters, p1Url);
  if (template.j2?.characters) await drawCharacter(canvas, template.j2.characters, p2Url);

  // 3. Tags joueurs
  if (template.j1?.tag) drawTag(canvas, template.j1.tag, p1Tag);
  if (template.j2?.tag) drawTag(canvas, template.j2.tag, p2Tag);

  // 4. Phase
  if (template.phase1) drawTag(canvas, template.phase1, phase1Text);
  if (template.phase2) drawTag(canvas, template.phase2, phase2Text);

  // 5. VS
  if (template.vs) drawVS(canvas, template.vs);

  // 6. Images additionnelles
  if (template.images?.length) await drawExtraImages(canvas, template.images);

  canvas.renderAll();
}
