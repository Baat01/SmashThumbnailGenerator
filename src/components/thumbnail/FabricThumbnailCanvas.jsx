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
 * Via ref, expose :
 *   - renderSet(set)  : déclenche le rendu pour un set donné
 *   - exportPNG()     : retourne un data URL PNG du canvas
 */
const FabricThumbnailCanvas = forwardRef(function FabricThumbnailCanvas({ set, scale = 1 }, ref) {
  const canvasEl       = useRef(null);
  const fabricCanvas   = useRef(null);
  const { layoutTemplate, characterOverrides } = useAppStore();

  // ── Expose les méthodes au parent ────────────────────────────────────────
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

  // ── Init du canvas Fabric.js ─────────────────────────────────────────────
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

  // ── Re-render quand le set ou le template change ─────────────────────────
  useEffect(() => {
    if (!fabricCanvas.current || !layoutTemplate || !set) return;
    doRender(fabricCanvas.current, set);
  }, [layoutTemplate, set, characterOverrides]);

  // ── Fonction interne de rendu ─────────────────────────────────────────────
  const doRender = useCallback(async (canvas, targetSet) => {
    if (!targetSet || !layoutTemplate) return;

    const setOverrides = characterOverrides[targetSet.id] ?? {};
    const charUrls = {};

    // Traduit l'ID de personnage choisi → URL de l'image GitHub
    if (setOverrides.p1CharId) {
      const char = CHARACTER_MAP[setOverrides.p1CharId];
      if (char) charUrls.p1CharUrl = getCharacterImageUrl(char.slug);
    }
    if (setOverrides.p2CharId) {
      const char = CHARACTER_MAP[setOverrides.p2CharId];
      if (char) charUrls.p2CharUrl = getCharacterImageUrl(char.slug);
    }

    await renderThumbnail(canvas, layoutTemplate, targetSet, charUrls);
  }, [layoutTemplate, characterOverrides]);

  // ── Rendu JSX ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width:    1280 * scale,
        height:   720 * scale,
        overflow: 'hidden',
        flexShrink: 0,
        borderRadius: 8,
      }}
    >
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: 1280,
        height: 720,
      }}>
        <canvas ref={canvasEl} />
      </div>
    </div>
  );
});

export default FabricThumbnailCanvas;
