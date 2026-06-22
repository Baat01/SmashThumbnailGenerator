import useAppStore from '../../store/appStore';
import SetCard from './SetCard';
import EventPicker from '../tournament/EventPicker';

export default function SetList() {
  const {
    sets, setsLoading, selectedSets,
    events,
    selectAllSets, clearSetSelection,
    selectedTournament, setStep
  } = useAppStore();

  // ── Skeleton de chargement ─────────────────────────────────────────────────
  if (setsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 w-full animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="skeleton h-8 w-64 rounded" />
        </div>
        <p className="text-[var(--color-muted)] text-sm mb-4">Chargement des sets…</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Sélection d'event (plusieurs events, pas encore de sets chargés) ───────
  if (events.length > 1 && sets.length === 0) {
    return <EventPicker />;
  }

  // ── Grille de sets ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 w-full animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Sets de{' '}
            <span className="gradient-text truncate">{selectedTournament?.name}</span>
          </h2>
          <p className="text-[var(--color-muted)] text-sm mt-1">
            {sets.length} sets complétés · {selectedSets.length} sélectionné{selectedSets.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={selectAllSets}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white hover:border-white/20 transition-colors"
          >
            Tout sélectionner
          </button>
          <button
            onClick={clearSetSelection}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white hover:border-white/20 transition-colors"
          >
            Tout désélectionner
          </button>
          <button
            onClick={() => setStep(3)}
            disabled={selectedSets.length === 0}
            className="
              text-sm px-4 py-1.5 rounded-lg font-semibold text-white
              bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)]
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:opacity-90 active:scale-95 transition-all duration-200
            "
          >
            Générer {selectedSets.length > 0 ? `(${selectedSets.length})` : ''} →
          </button>
        </div>
      </div>

      {sets.length === 0 ? (
        <div className="glass p-12 text-center text-[var(--color-muted)]">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-white font-medium mb-2">Aucun set terminé trouvé</p>
          <ul className="list-disc list-inside text-sm text-left inline-block mt-2 space-y-1">
            <li>Les résultats sont bien saisis dans Start.gg ?</li>
            <li>L'event est bien finalisé (pas "en cours") ?</li>
          </ul>
          <p className="mt-3 text-xs text-[var(--color-accent)]">
            💡 F12 → Console pour voir les logs détaillés de l'API.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map(set => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
}
