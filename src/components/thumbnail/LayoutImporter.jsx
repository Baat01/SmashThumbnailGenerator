import { useRef } from 'react';
import useAppStore from '../../store/appStore';

/**
 * LayoutImporter
 *
 * Importe le fichier JSON exporté par SmashThumbnailGenerator.
 * Ce JSON contient toute la configuration du canvas (fonds, personnages, tags, VS…).
 */
export default function LayoutImporter() {
  const { layoutTemplate, layoutTemplateName, setLayoutTemplate, clearLayoutTemplate } = useAppStore();
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;

    // Accepte uniquement les fichiers JSON
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      alert('Seuls les fichiers JSON exportés par SmashThumbnailGenerator sont acceptés.');
      return;
    }

    try {
      const text = await file.text();
      const template = JSON.parse(text);

      // Validation minimale : le JSON doit contenir j1 et j2
      if (!template.j1 || !template.j2) {
        alert('Ce fichier JSON ne semble pas être un template SmashThumbnailGenerator valide (j1 / j2 manquants).');
        return;
      }

      setLayoutTemplate(template, file.name);
    } catch (e) {
      alert(`Impossible de lire le fichier : ${e.message}`);
    }
  }

  function handleChange(e) {
    handleFile(e.target.files?.[0]);
    // Reset pour permettre de re-sélectionner le même fichier
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }

  // ── Aperçu du template ───────────────────────────────────────────────────
  if (layoutTemplate) {
    const j1Colors = layoutTemplate.j1?.bg?.gradient?.colors;
    const j2Colors = layoutTemplate.j2?.bg?.gradient?.colors;

    return (
      <div className="w-full">
        <p className="text-xs font-medium text-[var(--color-muted)] mb-2 uppercase tracking-wider">
          Template chargé
        </p>
        <div className="glass p-3 flex items-center gap-3">
          {/* Mini aperçu des couleurs du template */}
          <div className="w-14 h-9 rounded overflow-hidden shrink-0 flex">
            {j1Colors && (
              <div
                className="flex-1"
                style={{
                  background: j1Colors.length > 1
                    ? `linear-gradient(to bottom right, ${j1Colors[0].hex}, ${j1Colors[1].hex})`
                    : j1Colors[0]?.hex,
                }}
              />
            )}
            {j2Colors && (
              <div
                className="flex-1"
                style={{
                  background: j2Colors.length > 1
                    ? `linear-gradient(to bottom left, ${j2Colors[0].hex}, ${j2Colors[1].hex})`
                    : j2Colors[0]?.hex,
                }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{layoutTemplateName}</p>
            <p className="text-[var(--color-muted)] text-xs">
              Template JSON ✓
              {layoutTemplate.j1?.characters?.character?.name && (
                <> · {layoutTemplate.j1.characters.character.name} vs {layoutTemplate.j2?.characters?.character?.name}</>
              )}
            </p>
          </div>

          <button
            onClick={clearLayoutTemplate}
            className="shrink-0 text-[var(--color-muted)] hover:text-white transition-colors"
            aria-label="Supprimer le template"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // ── Zone de drop ─────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <p className="text-xs font-medium text-[var(--color-muted)] mb-2 uppercase tracking-wider">
        Template de miniature
      </p>
      <div
        id="layout-drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="
          glass border-dashed border-2 border-[var(--color-border)]
          hover:border-[var(--color-accent)]/50 hover:bg-white/5
          p-6 text-center cursor-pointer transition-all duration-200
          rounded-xl flex flex-col items-center gap-2
        "
      >
        <span className="text-3xl">📄</span>
        <p className="text-white text-sm font-medium">Importer un template JSON</p>
        <p className="text-[var(--color-muted)] text-xs leading-relaxed">
          Exporte ton layout depuis{' '}
          <a
            href="https://kekwel.github.io/SmashThumbnailGenerator/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            SmashThumbnailGenerator
          </a>
          , puis glisse le fichier <code className="bg-white/10 px-1 rounded">.json</code> ici.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
