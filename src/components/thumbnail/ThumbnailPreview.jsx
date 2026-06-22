import { useRef, useState } from 'react';
import useAppStore from '../../store/appStore';
import LayoutImporter from './LayoutImporter';
import FabricThumbnailCanvas from './FabricThumbnailCanvas';
import { getPlayerTag } from '../../utils/characters';

/**
 * ThumbnailPreview
 *
 * Page de génération.
 * - Aperçu live du 1er set sélectionné via Fabric.js
 * - Génération en boucle : render → export PNG → téléchargement → set suivant
 */
export default function ThumbnailPreview() {
  const {
    sets, selectedSets,
    selectedTournament,
    layoutTemplate,
    setStep, setIsGenerating, setGeneratedCount,
    isGenerating, generatedCount,
  } = useAppStore();

  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);

  const setsToGenerate = sets.filter(s => selectedSets.includes(s.id));
  const previewSet = setsToGenerate[0] ?? null;

  // ── Génération en boucle ──────────────────────────────────────────────────
  async function handleGenerate() {
    if (!layoutTemplate) {
      alert('Importe d\'abord un template JSON depuis SmashThumbnailGenerator.');
      return;
    }
    if (setsToGenerate.length === 0) return;

    setIsGenerating(true);
    setGeneratedCount(0);
    setProgress(0);

    for (let i = 0; i < setsToGenerate.length; i++) {
      const set = setsToGenerate[i];

      // 1. Rendre ce set sur le canvas Fabric.js
      await canvasRef.current?.renderSet(set);

      // 2. Courte pause pour que Fabric finisse le rendu (images async)
      await new Promise(r => setTimeout(r, 300));

      // 3. Exporter en PNG et déclencher le téléchargement
      const dataUrl = canvasRef.current?.exportPNG();
      if (dataUrl) {
        const p1 = getPlayerTag(set.slots?.[0]?.entrant);
        const p2 = getPlayerTag(set.slots?.[1]?.entrant);
        const round = set.fullRoundText ?? `Round ${set.round}`;
        const filename = `${round} - ${p1} vs ${p2}.png`
          .replace(/[/\\?%*:|"<>]/g, '-');

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
      }

      setGeneratedCount(i + 1);
      setProgress(Math.round(((i + 1) / setsToGenerate.length) * 100));

      // Pause entre les téléchargements pour ne pas saturer le navigateur
      if (i < setsToGenerate.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    setIsGenerating(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Génération des <span className="gradient-text">Miniatures</span>
          </h2>
          <p className="text-[var(--color-muted)] text-sm mt-1">
            {setsToGenerate.length} miniature{setsToGenerate.length > 1 ? 's' : ''} · {selectedTournament?.name}
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
        {/* ── Colonne gauche : config + actions ─────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Import du template */}
          <div className="glass p-5">
            <LayoutImporter />
          </div>

          {/* Alerte si pas de template */}
          {!layoutTemplate && (
            <div className="glass p-4 border-yellow-500/30 bg-yellow-900/10">
              <p className="text-yellow-300 text-sm font-medium mb-1">⚠️ Template requis</p>
              <p className="text-[var(--color-muted)] text-xs">
                Configure ton layout sur{' '}
                <a
                  href="https://kekwel.github.io/SmashThumbnailGenerator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  SmashThumbnailGenerator
                </a>
                , exporte-le en JSON, puis importe-le ici.
              </p>
            </div>
          )}

          {/* Liste des sets */}
          <div className="glass p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              Sets sélectionnés ({setsToGenerate.length})
            </h3>
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
              {setsToGenerate.map(set => (
                <div key={set.id} className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                  <span className="truncate flex-1">{set.fullRoundText}</span>
                  <span className="text-[var(--color-accent)] shrink-0 ml-2 font-medium">
                    {getPlayerTag(set.slots?.[0]?.entrant)} vs {getPlayerTag(set.slots?.[1]?.entrant)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton Générer / Barre de progression */}
          {!isGenerating ? (
            <button
              id="generate-all-btn"
              onClick={handleGenerate}
              disabled={setsToGenerate.length === 0 || !layoutTemplate}
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
                    background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-2))',
                  }}
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] text-center">
                Les PNG se téléchargent automatiquement…
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

        {/* ── Colonne droite : aperçu Fabric.js ──────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="glass p-4">
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-3 font-medium">
              Aperçu — {previewSet
                ? `${getPlayerTag(previewSet.slots?.[0]?.entrant)} vs ${getPlayerTag(previewSet.slots?.[1]?.entrant)}`
                : 'Aucun set sélectionné'
              }
            </p>

            {layoutTemplate && previewSet ? (
              /* Canvas Fabric.js mis à l'échelle 50% pour l'aperçu */
              <div className="w-full overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '16/9' }}>
                <FabricThumbnailCanvas
                  ref={canvasRef}
                  set={previewSet}
                  scale={0.5}
                />
              </div>
            ) : (
              <div className="aspect-video bg-[var(--color-surface-2)] rounded-lg flex flex-col items-center justify-center gap-3 text-[var(--color-muted)]">
                {!layoutTemplate ? (
                  <>
                    <span className="text-4xl">📄</span>
                    <p className="text-sm">Importe un template JSON pour voir l'aperçu</p>
                  </>
                ) : (
                  <>
                    <span className="text-4xl">⚔️</span>
                    <p className="text-sm">Aucun set sélectionné</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info sur le workflow */}
          {!layoutTemplate && (
            <div className="glass p-4 mt-4">
              <h4 className="text-sm font-semibold text-white mb-2">Comment ça marche ?</h4>
              <ol className="text-xs text-[var(--color-muted)] space-y-2 list-decimal list-inside">
                <li>
                  Va sur{' '}
                  <a href="https://kekwel.github.io/SmashThumbnailGenerator/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                    SmashThumbnailGenerator
                  </a>{' '}
                  et configure ton layout (couleurs, personnages par défaut, police…)
                </li>
                <li>Clique sur <strong className="text-white">Exporter → JSON</strong> pour télécharger le template</li>
                <li>Importe ce fichier JSON ici via le bouton ci-dessus</li>
                <li>Les noms de joueurs et la phase du set seront injectés automatiquement dans le template</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
