/**
 * fabricRenderer.js
 *
 * Moteur de rendu Fabric.js fidèle au SmashThumbnailGenerator original.
 * Reconstruit le canvas depuis le JSON exporté par l'app originale.
 *
 * Basé sur l'analyse du code source de :
 *   https://github.com/Kekwel/SmashThumbnailGenerator
 *
 * Logique clé (CustomText.js original, ligne 97-101) :
 *   group = new fabric.Group([bgRect, textObj], { left: text.x, top: text.y })
 *   → Les enfants sont déjà en coordonnées canvas absolues.
 *   → Le groupe est positionné à (text.x, text.y) avec originX:'left', originY:'top' (défaut Fabric).
 *   → PAS de originX:'center'.
 *
 * Z-Order :
 *   Chaque élément du JSON a un champ `index` qui correspond à sa position dans la pile Fabric.
 *   Après ajout au canvas, on appelle canvas.moveTo(objet, index) pour respecter cet ordre.
 *   Les fonds (bg) sans index sont envoyés en arrière avec sendToBack.
 */

import { fabric } from 'fabric';

// ─── Assets GitHub ─────────────────────────────────────────────────────────────
const ASSETS_BASE =
  'https://raw.githubusercontent.com/Kekwel/ThumbnailGeneratorAssets/main/games/ult';

export function getCharacterImageUrl(formatName, row = '0', col = '00') {
  return `${ASSETS_BASE}/char/${formatName}_${row}_${String(col).padStart(2, '0')}.png`;
}

/**
 * Découpe un texte de round en deux parties pour les deux bandeaux.
 * "Winners Round 1" → ["Winners", "Round 1"]
 * "Grand Final"     → ["Grand", "Final"]
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
  const colorStops = (colors ?? []).map((c, i) => ({
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

/**
 * Dessine le fond gradient d'un joueur (j1.bg ou j2.bg).
 * bg = { width, height, x, y, gradient:{colors}, colorDirection? }
 * Les fonds n'ont pas d'index dans le JSON original — ils sont envoyés en arrière.
 */
export function drawBackground(canvas, bg) {
  const fill = makeGradient(bg.gradient.colors, bg.width, bg.height, bg.colorDirection);
  const rect = new fabric.Rect({
    left: bg.x,
    top: bg.y,
    width: bg.width,
    height: bg.height,
    fill,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top',
  });
  canvas.add(rect);
  canvas.sendToBack(rect);
  return rect;
}

// ─── Image de personnage ───────────────────────────────────────────────────────

/**
 * Charge et dessine une image de personnage (j1.characters ou j2.characters).
 * Applique le z-order via canvas.moveTo(img, zIndex) si fourni.
 */
export function drawCharacter(canvas, charData, overrideUrl = null, zIndex = null) {
  return new Promise((resolve) => {
    const rawUrl = overrideUrl || charData?.url;
    if (!rawUrl) { resolve(null); return; }

    const { x, y, width, height, flipX, angle, scale, shadow } = charData;

    const applyAndAdd = (img) => {
      const origW = img.getOriginalSize?.()?.width  ?? img.width;
      const origH = img.getOriginalSize?.()?.height ?? img.height;

      img.set({
        left:    x  ?? 0,
        top:     y  ?? 0,
        scaleX:  ((width  ?? origW) / origW) * (scale?.x ?? 1),
        scaleY:  ((height ?? origH) / origH) * (scale?.y ?? 1),
        flipX:   flipX ?? false,
        angle:   angle ?? 0,
        selectable: false,
        evented:    false,
        originX: 'left',
        originY: 'top',
      });

      if (shadow?.active) {
        img.set('shadow', new fabric.Shadow({
          color:   shadow.color   ?? '#000000',
          blur:    shadow.blur    ?? 10,
          offsetX: shadow.x       ?? 5,
          offsetY: shadow.y       ?? 5,
        }));
      }

      canvas.add(img);
      if (zIndex !== null && zIndex !== undefined) {
        canvas.moveTo(img, zIndex);
      }
      resolve(img);
    };

    const tryLoad = (url, fallback) => {
      fabric.Image.fromURL(
        url,
        (img) => {
          if (!img || img.width === 0) {
            if (fallback) fallback();
            else resolve(null);
            return;
          }
          applyAndAdd(img);
        },
        { crossOrigin: 'anonymous' }
      );
    };

    // Proxy CORS pour contourner les restrictions GitHub raw
    const proxied = `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`;
    tryLoad(rawUrl, () => tryLoad(proxied, null));
  });
}

// ─── Bandeau de tag ─────────────────────────────────────────────────────────────
//
// Reproduction exacte de CustomText.js (original) :
//
//   bgRect  → créé aux coordonnées canvas ABSOLUES (bg.x, bg.y)
//   textObj → créé aux coordonnées canvas ABSOLUES (text.x, text.y)
//   group   → new fabric.Group([bgRect, textObj], { left: text.x, top: text.y })
//             originX/Y = 'left'/'top' (DÉFAUT Fabric, pas 'center')
//   angle   → appliqué sur le groupe APRÈS création
//
// Pourquoi ça marche : quand Fabric crée le groupe, les enfants sont DÉJÀ à
// leur position canvas absolue. Fabric soustrait automatiquement la position
// du groupe des coordonnées des enfants pour les stocker en coordonnées locales.
// Résultat : le groupe tourne autour de son coin supérieur gauche (text.x, text.y).

export function drawTag(canvas, tagData, textOverride = null, fontOverride = null, sizeOverride = null, colorOverride = null, zIndex = null) {
  if (!tagData) return null;
  const { angle, text, bg } = tagData;
  const displayText = textOverride !== null ? textOverride : (text?.value ?? '');

  // Couleurs et gradient du bandeau
  const bgScaleX = bg?.scale?.x ?? 1;
  const bgScaleY = bg?.scale?.y ?? 1;
  const bgVisW   = (bg?.width  ?? 400) * bgScaleX;
  const bgVisH   = (bg?.height ?? 60)  * bgScaleY;
  const bgFill   = makeGradient(
    bg?.gradient?.colors ?? [{ hex: '#ffffff' }, { hex: '#ffffff' }],
    bgVisW, bgVisH,
    bg?.colorDirection
  );

  // Le bgRect est placé en haut à gauche du groupe
  const bgRect = new fabric.Rect({
    left: 0,
    top: 0,
    width: bgVisW,
    height: bgVisH,
    fill: bgFill,
    originX: 'left',
    originY: 'top',
    strokeWidth: 0,
  });

  const textObj = new fabric.Text(displayText, {
    left: 0, // Sera recalculé juste après
    top: 0,
    fontSize: sizeOverride ? parseInt(sizeOverride) : (text?.fontSize ?? 40),
    fill: colorOverride || text?.fill || '#000000',
    fontFamily: fontOverride || text?.font || 'Arial',
    fontWeight: text?.fontWeight ?? 'normal',
    fontStyle: text?.fontStyle ?? 'normal',
    originX: 'left',
    originY: 'top',
    strokeWidth: 0,
  });

  // Calcul du positionnement du texte par rapport au bgRect (qui est à 0,0)
  const padding = 25;
  const textW = textObj.getScaledWidth();
  const textH = textObj.getScaledHeight();

  let textLeft = (bgVisW - textW) / 2; // Par défaut au centre
  if (text?.alignmentX === 'left') {
    textLeft = padding;
  } else if (text?.alignmentX === 'right') {
    textLeft = bgVisW - textW - padding;
  }

  let textTop = (bgVisH - textH) / 2; // Par défaut au milieu
  if (text?.alignmentY === 'top') {
    textTop = padding;
  } else if (text?.alignmentY === 'bottom') {
    textTop = bgVisH - textH - padding;
  }

  textObj.set({
    left: textLeft,
    top: textTop
  });

  // text.x et text.y définissent le coin supérieur gauche absolu du bandeau !
  const group = new fabric.Group([bgRect, textObj], {
    left: text?.x ?? 0,
    top: text?.y ?? 0,
    originX: 'left',
    originY: 'top',
    angle: angle ?? 0,
    selectable: false,
    evented: false,
  });

  canvas.add(group);
  if (zIndex !== null && zIndex !== undefined) {
    canvas.moveTo(group, zIndex);
  }
  return group;
}

// ─── Texte VS ──────────────────────────────────────────────────────────────────

export function drawVS(canvas, vsData, fontOverride = null, sizeOverride = null, colorOverride = null, zIndex = null) {
  if (!vsData?.text) return null;
  const { text, shadow, scale, angle } = vsData;

  const vsText = new fabric.Text(text.value ?? 'VS', {
    left:       text.x ?? 640,
    top:        text.y ?? 305,
    fontSize:   sizeOverride ? parseInt(sizeOverride) * 2.5 : (text.fontSize ?? 99),
    fill:       colorOverride || text.fill || '#000000',
    fontFamily: fontOverride ?? text.font ?? 'Arial',
    fontWeight: text.fontWeight ?? 'bold',
    fontStyle:  text.fontStyle  ?? 'italic',
    originX:    'left',
    originY:    'top',
    angle:      angle ?? 0,
    scaleX:     scale?.x ?? 1,
    scaleY:     scale?.y ?? 1,
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
  if (zIndex !== null && zIndex !== undefined) {
    canvas.moveTo(vsText, zIndex);
  }
  return vsText;
}

// ─── Images additionnelles ─────────────────────────────────────────────────────

/**
 * Charge et dessine les images additionnelles (logos, overlays, etc.).
 * Gère les URLs HTTP et les données base64 (data:image/...).
 * Respecte le z-order via l'index de chaque image.
 */
export async function drawExtraImages(canvas, images = []) {
  for (const imgData of images) {
    if (!imgData?.url) continue;
    await new Promise((resolve) => {
      fabric.Image.fromURL(
        imgData.url,
        (img) => {
          if (!img || img.width === 0) { resolve(); return; }

          const origW = img.getOriginalSize?.()?.width  ?? img.width;
          const origH = img.getOriginalSize?.()?.height ?? img.height;

          // Calcul du scale : si width/height sont fournis, on s'en sert,
          // sinon on tombe sur scaleX/scaleY directs.
          let scaleX = imgData.scaleX ?? 1;
          let scaleY = imgData.scaleY ?? 1;
          if (imgData.width && origW) scaleX = imgData.width / origW * (imgData.scale?.x ?? 1);
          if (imgData.height && origH) scaleY = imgData.height / origH * (imgData.scale?.y ?? 1);

          img.set({
            left:    imgData.x       ?? 0,
            top:     imgData.y       ?? 0,
            scaleX,
            scaleY,
            flipX:   imgData.flipX   ?? false,
            angle:   imgData.angle   ?? 0,
            opacity: imgData.opacity ?? 1,
            selectable: false,
            evented:    false,
            originX: 'left',
            originY: 'top',
          });

          canvas.add(img);

          // Respecter le z-order si un index est fourni
          if (imgData.index !== null && imgData.index !== undefined) {
            canvas.moveTo(img, imgData.index);
          }

          resolve(img);
        },
        // crossOrigin n'est PAS envoyé pour les data: URLs (Fabric le gère nativement)
        imgData.url.startsWith('data:') ? {} : { crossOrigin: 'anonymous' }
      );
    });
  }
}

// ─── Fonction principale ────────────────────────────────────────────────────────

/**
 * Reconstruit le canvas Fabric.js à partir du template JSON et des données du set.
 *
 * @param {fabric.Canvas} canvas         Instance Fabric.js
 * @param {object}        template       JSON exporté par SmashThumbnailGenerator
 * @param {object}        set            Set Start.gg
 * @param {object}        charOverrides  { p1CharUrl?, p2CharUrl? }
 * @param {string}        fontOverride   Nom de police globale (optionnel)
 */
export async function renderThumbnail(canvas, template, set, charOverrides = {}, fontOverride = null, sizeOverride = null, colorOverride = null) {
  canvas.clear();
  canvas.setBackgroundColor('#111111', () => {});

  const p1Tag = set.slots?.[0]?.entrant?.participants?.[0]?.player?.gamerTag
             ?? set.slots?.[0]?.entrant?.name ?? 'P1';
  const p2Tag = set.slots?.[1]?.entrant?.participants?.[0]?.player?.gamerTag
             ?? set.slots?.[1]?.entrant?.name ?? 'P2';

  const roundText = set.fullRoundText ?? (set.round ? `Round ${set.round}` : '');
  const [phase1Text, phase2Text] = splitRoundText(roundText);

  // 1. Fonds (toujours en arrière, sendToBack dans drawBackground)
  if (template.j1?.bg) drawBackground(canvas, template.j1.bg);
  if (template.j2?.bg) drawBackground(canvas, template.j2.bg);

  // 2. Personnages (async, CORS) — avec z-order
  const p1Url = charOverrides.p1CharUrl || template.j1?.characters?.url || null;
  const p2Url = charOverrides.p2CharUrl || template.j2?.characters?.url || null;
  if (template.j1?.characters) {
    await drawCharacter(canvas, template.j1.characters, p1Url, template.j1.characters.index ?? null);
  }
  if (template.j2?.characters) {
    await drawCharacter(canvas, template.j2.characters, p2Url, template.j2.characters.index ?? null);
  }

  // 3. Tags joueurs — avec z-order
  if (template.j1?.tag) {
    drawTag(canvas, template.j1.tag, p1Tag, fontOverride, sizeOverride, colorOverride, template.j1.tag.index ?? null);
  }
  if (template.j2?.tag) {
    drawTag(canvas, template.j2.tag, p2Tag, fontOverride, sizeOverride, colorOverride, template.j2.tag.index ?? null);
  }

  // 4. Phase — avec z-order
  if (template.phase1) {
    drawTag(canvas, template.phase1, phase1Text, fontOverride, sizeOverride, colorOverride, template.phase1.index ?? null);
  }
  if (template.phase2) {
    drawTag(canvas, template.phase2, phase2Text, fontOverride, sizeOverride, colorOverride, template.phase2.index ?? null);
  }

  // 5. VS — avec z-order
  if (template.vs) {
    drawVS(canvas, template.vs, fontOverride, sizeOverride, colorOverride, template.vs.index ?? null);
  }

  // 6. Images additionnelles (logos, overlays, etc.) — avec z-order géré dans drawExtraImages
  if (template.images?.length) {
    await drawExtraImages(canvas, template.images);
  }

  canvas.renderAll();
}
