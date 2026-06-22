import { useRef } from 'react';
import useAppStore from '../../store/appStore';
import { fileToDataUrl } from '../../utils/export';

export default function LayoutImporter() {
  const { layoutImage, layoutImageName, setLayoutImage } = useAppStore();
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataUrl(file);
    setLayoutImage(dataUrl, file.name);
  }

  function handleChange(e) {
    handleFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-[var(--color-muted)] mb-2 uppercase tracking-wider">
        Image de fond (Layout)
      </p>

      {layoutImage ? (
        /* Aperçu du layout importé */
        <div className="flex items-center gap-3 glass p-3">
          <img
            src={layoutImage}
            alt="Layout"
            className="w-16 h-10 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{layoutImageName}</p>
            <p className="text-[var(--color-muted)] text-xs">Layout importé ✓</p>
          </div>
          <button
            onClick={() => setLayoutImage(null, '')}
            className="text-[var(--color-muted)] hover:text-white transition-colors text-sm"
            aria-label="Supprimer le layout"
          >
            ✕
          </button>
        </div>
      ) : (
        /* Zone de drop */
        <div
          id="layout-drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="
            glass border-dashed border-2 border-[var(--color-border)]
            hover:border-[var(--color-accent)]/50 hover:bg-white/5
            p-6 text-center cursor-pointer transition-all duration-200
            rounded-xl flex flex-col items-center gap-2
          "
        >
          <span className="text-3xl">🖼️</span>
          <p className="text-white text-sm font-medium">Importer un layout</p>
          <p className="text-[var(--color-muted)] text-xs">
            Glisse une image ici ou clique pour parcourir
          </p>
          <p className="text-[var(--color-muted)] text-[10px]">PNG, JPG, WebP · 1280×720 recommandé</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
