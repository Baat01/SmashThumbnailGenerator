import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { fabric } from 'fabric';
import { renderThumbnail, getCharacterImageUrl } from '../../utils/fabricRenderer';
import { CHARACTER_MAP } from '../../utils/characters';
import useAppStore from '../../store/appStore';

/**
 * FabricThumbnailCanvas
 *
 * Composant React encapsulant un canvas Fabric.js 1280×720.
 * Reconstruit la miniature depuis le template JSON importé et les données du set.
 *
 * Priorité pour les personnages :
 *   1. Override manuel (CharacterPicker)
 *   2. Personnage détecté automatiquement par l'API (slot.detectedCharacters[0])
 *   3. Personnage par défaut du template JSON
 *
 * Via ref, expose :
 *   - renderSet(set)  : déclenche le rendu pour un set donné
 *   - exportPNG()     : retourne un data URL PNG du canvas
 */
const FabricThumbnailCanvas = forwardRef(function FabricThumbnailCanvas({ set, scale = 1 }, ref) {
  const canvasEl     = useRef(null);
  const fabricCanvas = useRef(null);
  const { layoutTemplate, characterOverrides, selectedFont, selectedFontSize, selectedFontColor } = useAppStore();

  // ── Expose les méthodes au parent ──────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    async renderSet(targetSet) {
      if (!fabricCanvas.current || !layoutTemplate) return;
      await doRender(fabricCanvas.current, targetSet);
    },
    exportPNG() {
      if (!fabricCanvas.current) return null;
      return fabricCanvas.current.toDataURL({ format: 'png', multiplier: 1 });
    },
  }));

  // ── Init du canvas Fabric.js ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasEl.current, {
      width: 1280,
      height: 720,
      selection: false,
      renderOnAddRemove: false,
    });
    fabricCanvas.current = canvas;

    return () => {
      canvas.dispose();
      fabricCanvas.current = null;
    };
  }, []);

  // ── Re-render quand le set, template ou police change ─────────────────────
  useEffect(() => {
    if (!fabricCanvas.current || !layoutTemplate || !set) return;
    doRender(fabricCanvas.current, set);
  }, [layoutTemplate, set, characterOverrides, selectedFont, selectedFontSize, selectedFontColor]);

  // ── Fonction interne de rendu ──────────────────────────────────────────────
  const doRender = useCallback(async (canvas, targetSet) => {
    if (!targetSet || !layoutTemplate) return;

    const setOverrides = characterOverrides[targetSet.id] ?? {};
    const charUrls = {};

    // ── Joueur 1 ─────────────────────────────────────────────────────────────
    if (setOverrides.p1CharId) {
      // 1. Override manuel
      const char = CHARACTER_MAP[setOverrides.p1CharId];
      if (char) charUrls.p1CharUrl = getCharacterImageUrl(char.slug);
    } else {
      // 2. Personnage détecté automatiquement depuis l'API (games.selections)
      const p1EntrantId = targetSet.slots?.[0]?.entrant?.id;
      const detected    = targetSet.slots?.[0]?.detectedCharacters?.[0];
      if (detected) {
        charUrls.p1CharUrl = resolveDetectedCharacterUrl(detected);
      }
    }

    // ── Joueur 2 ─────────────────────────────────────────────────────────────
    if (setOverrides.p2CharId) {
      const char = CHARACTER_MAP[setOverrides.p2CharId];
      if (char) charUrls.p2CharUrl = getCharacterImageUrl(char.slug);
    } else {
      const detected = targetSet.slots?.[1]?.detectedCharacters?.[0];
      if (detected) {
        charUrls.p2CharUrl = resolveDetectedCharacterUrl(detected);
      }
    }

    await renderThumbnail(
      canvas,
      layoutTemplate,
      targetSet,
      charUrls,
      selectedFont || null,
      selectedFontSize || null,
      selectedFontColor || null
    );
  }, [layoutTemplate, characterOverrides, selectedFont, selectedFontSize, selectedFontColor]);

  // ── Rendu JSX ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width:      1280 * scale,
        height:     720  * scale,
        overflow:   'hidden',
        flexShrink: 0,
        borderRadius: 8,
      }}
    >
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width:  1280,
        height: 720,
      }}>
        <canvas ref={canvasEl} />
      </div>
    </div>
  );
});

// ─── Helper : convertit un character Start.gg { id, name } en URL d'image ────
// Recherche d'abord dans notre CHARACTER_MAP local (slug pour URL exacte),
// sinon on construit une URL depuis le nom formaté.
function resolveDetectedCharacterUrl(character) {
  const ASSETS = 'https://raw.githubusercontent.com/Kekwel/ThumbnailGeneratorAssets/main/games/ult/char';

  // Cherche dans CHARACTER_MAP par nom exact
  const match = Object.values(CHARACTER_MAP).find(
    c => c.name.toLowerCase() === character.name.toLowerCase()
  );
  if (match) return `${ASSETS}/${match.slug}_0_00.png`;

  // Fallback : formatName depuis le nom (minuscules, espaces → _)
  const slug = character.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `${ASSETS}/${slug}_0_00.png`;
}

export default FabricThumbnailCanvas;
