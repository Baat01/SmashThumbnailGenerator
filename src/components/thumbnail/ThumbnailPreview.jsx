import { useRef, useState } from 'react';
import useAppStore from '../../store/appStore';
import LayoutImporter from './LayoutImporter';
import ThumbnailCanvas from './ThumbnailCanvas';
import { exportElementAsPNG } from '../../utils/export';
import { getPlayerTag } from '../../utils/characters';

export default function ThumbnailPreview() {
  const {
    sets, selectedSets, characterOverrides,
    layoutImage, selectedTournament, setStep,
    isGenerating, setIsGenerating, generatedCount, setGeneratedCount,
  } = useAppStore();

  const [progress, setProgress] = useState(0);
  const canvasRefs = useRef({});

  const setsToGenerate = sets.filter(s => selectedSets.includes(s.id));
  const previewSet = setsToGenerate[0] ?? null;

  function setRef(setId, el) {
    if (el) canvasRefs.current[setId] = el;
  }

  async function handleGenerate() {
    if (setsToGenerate.length === 0) return;
    setIsGenerating(true);
    setGeneratedCount(0);
    setProgress(0);

    for (let i = 0; i < setsToGenerate.length; i++) {
      const set = setsToGenerate[i];
      const el  = canvasRefs.current[set.id];
      if (!el) continue;

      const p1Tag = getPlayerTag(set.slots?.[0]?.entrant);
      const p2Tag = getPlayerTag(set.slots?.[1]?.entrant);
      const round = set.fullRoundText ?? `Round ${set.round}`;
      const filename = `${round} - ${p1Tag} vs ${p2Tag}`
        .replace(/[/\\?%*:|"<>]/g, '-');

      await exportElementAsPNG(el, filename);
      setGeneratedCount(i + 1);
      setProgress(Math.round(((i + 1) / setsToGenerate.length) * 100));

      if (i < setsToGenerate.length - 1) {
        await new Promise(r => setTimeout(r, 400));
      }
    }

    setIsGenerating(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Génération des <span className="gradient-text">Miniatures</span>
          </h2>
          <p className="text-[var(--color-muted)] text-sm mt-1">
            {setsToGenerate.length} miniature{setsToGenerate.length > 1 ? 's' : ''} à générer
            pour <strong className="text-white">{selectedTournament?.name}</strong>
          </p>
        </div>
        <button
          onClick={() => setStep(2)}
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white hover:border-white/20 transition-colors"
        >
          ← Retour aux sets
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : config + génération */}
        <div className="flex flex-col gap-4">
          {/* Import Layout */}
          <div className="glass p-5">
            <LayoutImporter />
          </div>

          {/* Résumé des sets */}
          <div className="glass p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              Sets sélectionnés ({setsToGenerate.length})
            </h3>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {setsToGenerate.map(set => (
                <div key={set.id} className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                  <span className="truncate">{set.fullRoundText}</span>
                  <span className="text-[var(--color-accent)] shrink-0 ml-2">
                    {getPlayerTag(set.slots?.[0]?.entrant)} vs {getPlayerTag(set.slots?.[1]?.entrant)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton Générer */}
          {!isGenerating ? (
            <button
              id="generate-all-btn"
              onClick={handleGenerate}
              disabled={setsToGenerate.length === 0}
              className="
                w-full py-4 px-6 rounded-xl font-bold text-white text-lg
                bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)]
                hover:opacity-90 active:scale-95 glow-accent
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              🚀 Générer {setsToGenerate.length} miniature{setsToGenerate.length > 1 ? 's' : ''}
            </button>
          ) : (
            /* Barre de progression */
            <div className="glass p-5 flex flex-col gap-3">
              <div className="flex justify-between text-sm text-white font-medium">
                <span>Génération en cours…</span>
                <span>{generatedCount} / {setsToGenerate.length}</span>
              </div>
              <div className="w-full bg-[var(--color-surface-2)] rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-2))'
                  }}
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] text-center">
                Les fichiers PNG se téléchargent automatiquement…
              </p>
            </div>
          )}

          {/* Succès */}
          {!isGenerating && generatedCount > 0 && (
            <div className="glass p-4 text-center border-green-500/30 bg-green-900/10">
              <div className="text-2xl mb-1">✅</div>
              <p className="text-green-400 font-semibold text-sm">
                {generatedCount} miniature{generatedCount > 1 ? 's' : ''} générée{generatedCount > 1 ? 's' : ''} !
              </p>
            </div>
          )}
        </div>

        {/* Colonne droite : aperçu 16/9 */}
        <div className="lg:col-span-2">
          <div className="glass p-4">
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-3 font-medium">
              Aperçu — {previewSet ? `${getPlayerTag(previewSet.slots?.[0]?.entrant)} vs ${getPlayerTag(previewSet.slots?.[1]?.entrant)}` : 'Aucun set'}
            </p>
            {previewSet ? (
              <div
                className="w-full overflow-hidden rounded-lg"
                style={{ aspectRatio: '16/9' }}
              >
                <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}>
                  <ThumbnailCanvas set={previewSet} ref={el => setRef(previewSet.id, el)} />
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-[var(--color-surface-2)] rounded-lg flex items-center justify-center text-[var(--color-muted)]">
                Aucun set sélectionné
              </div>
            )}
          </div>

          {/* Canvases cachés pour les autres sets */}
          <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }}>
            {setsToGenerate.slice(1).map(set => (
              <ThumbnailCanvas
                key={set.id}
                set={set}
                ref={el => setRef(set.id, el)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
