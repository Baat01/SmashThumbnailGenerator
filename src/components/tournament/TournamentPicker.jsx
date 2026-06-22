import useAppStore from '../../store/appStore';
import { useSets } from '../../hooks/useSets';

/** Formatte un timestamp Unix en date lisible */
function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

export default function TournamentPicker() {
  const { tournaments, selectedTournament, selectTournament, setStep, logout, user } = useAppStore();
  const { loadSets } = useSets();

  async function handleSelect(tournament) {
    selectTournament(tournament);
    await loadSets(tournament);
    setStep(2);
  }

  return (
    <div className="animate-fade-in-up px-4 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Tes Tournois <span className="gradient-text">Start.gg</span>
          </h2>
          {user && (
            <p className="text-[var(--color-muted)] text-sm mt-1">
              Connecté en tant que <strong className="text-white">{user.name}</strong>
              {' · '}{tournaments.length} tournoi{tournaments.length > 1 ? 's' : ''} trouvé{tournaments.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={logout}
          className="text-xs text-[var(--color-muted)] hover:text-white transition-colors border border-[var(--color-border)] px-3 py-1.5 rounded-lg hover:border-white/20"
        >
          ← Déconnexion
        </button>
      </div>

      {/* Grille de tournois */}
      {tournaments.length === 0 ? (
        <div className="glass p-12 text-center text-[var(--color-muted)]">
          <div className="text-4xl mb-3">🏜️</div>
          <p>Aucun tournoi trouvé sur ce compte.</p>
          <p className="text-xs mt-2">Seuls les tournois <em>passés et organisés par toi</em> sont affichés.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map(t => {
            const logo = t.images?.find(img => img.type === 'profile')?.url
                      ?? t.images?.[0]?.url
                      ?? null;
            const isSelected = selectedTournament?.id === t.id;

            return (
              <button
                key={t.id}
                id={`tournament-${t.id}`}
                onClick={() => handleSelect(t)}
                className={`
                  glass text-left p-4 flex gap-4 items-start cursor-pointer
                  transition-all duration-200 hover:border-[var(--color-accent)]/50
                  hover:bg-white/5 active:scale-95 group
                  ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : ''}
                `}
              >
                {/* Logo */}
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-surface-2)] flex items-center justify-center">
                  {logo ? (
                    <img src={logo} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🏆</span>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                    {t.name}
                  </h3>
                  <p className="text-[var(--color-muted)] text-xs mt-1">{formatDate(t.startAt)}</p>
                  {t.numAttendees && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                      👥 {t.numAttendees} participants
                    </span>
                  )}
                </div>

                {/* Selected badge */}
                {isSelected && (
                  <span className="shrink-0 text-[var(--color-accent)] text-lg">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
