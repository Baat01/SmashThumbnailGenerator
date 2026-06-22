import useAppStore from '../../store/appStore';
import SetCard from './SetCard';

export default function SetList() {
  const {
    sets, setsLoading, selectedSets,
    selectAllSets, clearSetSelection,
    selectedTournament, setStep
  } = useAppStore();

  if (setsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 w-full animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="skeleton h-8 w-64 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Sets de{' '}
            <span className="gradient-text truncate">
              {selectedTournament?.name}
            </span>
          </h2>
          <p className="text-[var(--color-muted)] text-sm mt-1">
            {sets.length} sets complétés · {selectedSets.length} sélectionné{selectedSets.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Actions */}
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

      {/* Grille de sets */}
      {sets.length === 0 ? (
        <div className="glass p-12 text-center text-[var(--color-muted)]">
          <div className="text-4xl mb-3">📭</div>
          <p>Aucun set complété trouvé pour ce tournoi.</p>
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
