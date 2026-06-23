import { useRef } from 'react';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../hooks/useTranslation';

// ─── Polices disponibles (avec chargement Google Fonts si nécessaire) ─────────
const FONTS = [
  { label: 'Template (défaut)',   value: ''              },
  { label: 'Futura Bold',         value: 'Futura Bold'   },
  { label: 'Inter',               value: 'Inter'         },
  { label: 'Rajdhani',            value: 'Rajdhani'      },
  { label: 'Arial',               value: 'Arial'         },
  { label: 'Impact',              value: 'Impact'        },
  { label: 'Bebas Neue',          value: 'Bebas Neue'    },
  { label: 'Oswald',              value: 'Oswald'        },
  { label: 'Roboto',              value: 'Roboto'        },
  { label: 'Montserrat',          value: 'Montserrat'    },
  { label: 'Anton',               value: 'Anton'         },
];

// Police → URL Google Fonts (pour les charger dynamiquement si besoin)
const GOOGLE_FONT_URLS = {
  'Bebas Neue':  'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
  'Oswald':      'https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap',
  'Anton':       'https://fonts.googleapis.com/css2?family=Anton&display=swap',
  'Montserrat':  'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap',
};

function loadGoogleFont(fontName) {
  if (!GOOGLE_FONT_URLS[fontName]) return;
  const id = `gf-${fontName.replace(/\s+/g, '-')}`;
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id   = id;
    link.rel  = 'stylesheet';
    link.href = GOOGLE_FONT_URLS[fontName];
    document.head.appendChild(link);
  }
}

/**
 * LayoutImporter
 *
 * Importe le fichier JSON exporté par SmashThumbnailGenerator
 * (accepte .json ET .txt — même contenu JSON).
 * Contient aussi le sélecteur de police globale.
 */
export default function LayoutImporter() {
  const {
    layoutTemplate, layoutTemplateName,
    setLayoutTemplate, clearLayoutTemplate,
    selectedFont, setSelectedFont,
    selectedFontSize, setSelectedFontSize,
    selectedFontColor, setSelectedFontColor,
  } = useAppStore();
  const { t } = useTranslation();
  const inputRef = useRef(null);

  // ── Lecture du fichier ─────────────────────────────────────────────────────
  async function handleFile(file) {
    if (!file) return;

    const isJson = file.name.endsWith('.json') || file.type === 'application/json';
    const isTxt  = file.name.endsWith('.txt')  || file.type === 'text/plain';

    if (!isJson && !isTxt) {
      alert(t('layout.errorOnlyJson'));
      return;
    }

    try {
      const text     = await file.text();
      const template = JSON.parse(text);

      if (!template.j1 || !template.j2) {
        alert(t('layout.errorInvalid'));
        return;
      }

      setLayoutTemplate(template, file.name);
    } catch (e) {
      alert(`${t('layout.errorRead')} ${e.message}`);
    }
  }

  function handleChange(e) {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }

  function handleFontChange(e) {
    const font = e.target.value;
    setSelectedFont(font);
    if (font) loadGoogleFont(font);
  }

  // ── Sélecteur de police (toujours visible) ────────────────────────────────
  const fontPicker = (
    <div className="mt-4">
      <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider block mb-1.5">
        {t('layout.fontTitle')}
      </label>
      <select
        id="font-picker"
        value={selectedFont}
        onChange={handleFontChange}
        className="
          w-full px-3 py-2 rounded-lg text-sm text-white
          bg-[var(--color-surface-2)] border border-[var(--color-border)]
          focus:outline-none focus:border-[var(--color-accent)]
          hover:border-white/20 transition-colors cursor-pointer
        "
      >
        {FONTS.map(f => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value || 'inherit' }}>
            {f.label}
          </option>
        ))}
      </select>
      {selectedFont && (
        <p className="text-xs text-[var(--color-muted)] mt-1">
          {t('layout.fontOverrideMsg1')} <strong className="text-white">{selectedFont}</strong> {t('layout.fontOverrideMsg2')}
        </p>
      )}

      {/* Taille de police */}
      <div className="mt-4">
        <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider block mb-1.5">
          {t('layout.fontSizeTitle')}
        </label>
        <input
          type="number"
          placeholder="ex: 45"
          value={selectedFontSize}
          onChange={(e) => setSelectedFontSize(e.target.value)}
          className="
            w-full px-3 py-2 rounded-lg text-sm text-white
            bg-[var(--color-surface-2)] border border-[var(--color-border)]
            focus:outline-none focus:border-[var(--color-accent)]
            transition-colors
          "
        />
      </div>

      {/* Couleur du texte */}
      <div className="mt-4">
        <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider block mb-1.5">
          {t('layout.fontColorTitle')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={selectedFontColor || '#ffffff'}
            onChange={(e) => setSelectedFontColor(e.target.value)}
            className="w-10 h-10 p-1 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] cursor-pointer shrink-0"
          />
          <input
            type="text"
            placeholder="ex: #ffffff"
            value={selectedFontColor}
            onChange={(e) => setSelectedFontColor(e.target.value)}
            className="
              flex-1 px-3 py-2 rounded-lg text-sm text-white
              bg-[var(--color-surface-2)] border border-[var(--color-border)]
              focus:outline-none focus:border-[var(--color-accent)]
              transition-colors
            "
          />
        </div>
        <button 
          className="text-xs text-[var(--color-muted)] hover:text-white mt-1 underline"
          onClick={() => setSelectedFontColor('')}
        >
          {t('layout.resetColor')}
        </button>
      </div>
    </div>
  );

  // ── Template déjà chargé ───────────────────────────────────────────────────
  if (layoutTemplate) {
    const j1Colors = layoutTemplate.j1?.bg?.gradient?.colors;
    const j2Colors = layoutTemplate.j2?.bg?.gradient?.colors;

    return (
      <div className="w-full">
        <p className="text-xs font-medium text-[var(--color-muted)] mb-2 uppercase tracking-wider">
          {t('layout.loaded')}
        </p>
        <div className="glass p-3 flex items-center gap-3">
          {/* Mini aperçu des couleurs */}
          <div className="w-14 h-9 rounded overflow-hidden shrink-0 flex border border-white/10">
            {j1Colors && (
              <div className="flex-1" style={{
                background: j1Colors.length > 1
                  ? `linear-gradient(to bottom right, ${j1Colors[0].hex}, ${j1Colors[1].hex})`
                  : j1Colors[0]?.hex,
              }} />
            )}
            {j2Colors && (
              <div className="flex-1" style={{
                background: j2Colors.length > 1
                  ? `linear-gradient(to bottom left, ${j2Colors[0].hex}, ${j2Colors[1].hex})`
                  : j2Colors[0]?.hex,
              }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{layoutTemplateName}</p>
            <p className="text-[var(--color-muted)] text-xs">Template JSON ✓</p>
          </div>

          <button
            onClick={clearLayoutTemplate}
            className="shrink-0 text-[var(--color-muted)] hover:text-red-400 transition-colors text-lg leading-none"
            aria-label={t('layout.delete')}
            title={t('layout.delete')}
          >
            ✕
          </button>
        </div>

        {fontPicker}
      </div>
    );
  }

  // ── Zone de drop ───────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <p className="text-xs font-medium text-[var(--color-muted)] mb-2 uppercase tracking-wider">
        {t('layout.title')}
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
        <p className="text-white text-sm font-medium">{t('layout.dropzone')}</p>
        <p className="text-[var(--color-muted)] text-xs leading-relaxed">
          {t('layout.dropzoneDesc1')}{' '}
          <a
            href="https://kekwel.github.io/SmashThumbnailGenerator/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            SmashThumbnailGenerator
          </a>
          {t('layout.dropzoneDesc2')}{' '}
          <code className="bg-white/10 px-1 rounded">.json</code> {t('layout.dropzoneDesc3')}{' '}
          <code className="bg-white/10 px-1 rounded">.txt</code> {t('layout.dropzoneDesc4')}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".json,.txt,application/json,text/plain"
        className="hidden"
        onChange={handleChange}
      />

      <button
        onClick={async () => {
          const res = await fetch('/test_template.txt');
          const text = await res.text();
          setLayoutTemplate(JSON.parse(text), 'test_template.txt');
        }}
        className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs uppercase"
      >
        [DEBUG] Charger test_template.txt
      </button>

      {fontPicker}
    </div>
  );
}
