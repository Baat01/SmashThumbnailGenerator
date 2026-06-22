import useAppStore from '../../store/appStore';
import { useSets } from '../../hooks/useSets';

export default function EventPicker() {
  const { selectedTournament, events, setsLoading } = useAppStore();
  const { loadSetsForEvent } = useSets();

  // Map des états Start.gg pour un label lisible
  const stateLabel = {
    1: { label: 'Créé',      color: 'text-gray-400' },
    2: { label: 'En cours',  color: 'text-yellow-400' },
    3: { label: 'Terminé',   color: 'text-green-400' },
    6: { label: 'Terminé',   color: 'text-green-400' },
  };

  return (
    <div className="animate-fade-in-up px-4 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          Choisir un <span className="gradient-text">Event</span>
        </h2>
        <p className="text-[var(--color-muted)] text-sm mt-1">
          Le tournoi <strong className="text-white">{selectedTournament?.name}</strong> contient {events.length} events.
          Sélectionne celui dont tu veux générer les miniatures.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {events.map(event => {
          const state = stateLabel[event.state] ?? { label: `État ${event.state}`, color: 'text-gray-400' };

          return (
            <button
              key={event.id}
              id={`event-${event.id}`}
              onClick={() => loadSetsForEvent(event)}
              disabled={setsLoading}
              className="
                glass p-5 flex items-center justify-between text-left
                hover:border-[var(--color-accent)]/50 hover:bg-white/5
                active:scale-[0.99] transition-all duration-200 group
                disabled:opacity-60 disabled:cursor-wait
              "
            >
              <div>
                <h3 className="font-semibold text-white text-base group-hover:text-[var(--color-accent)] transition-colors">
                  {event.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs font-medium ${state.color}`}>
                    ● {state.label}
                  </span>
                  {event.numEntrants && (
                    <span className="text-xs text-[var(--color-muted)]">
                      {event.numEntrants} participants
                    </span>
                  )}
                </div>
              </div>

              {setsLoading ? (
                <svg className="animate-spin w-5 h-5 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <span className="text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors text-xl">→</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
