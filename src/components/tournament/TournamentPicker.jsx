import { useState } from 'react';
import useAppStore from '../../store/appStore';
import { useSets } from '../../hooks/useSets';
import { useTranslation } from '../../hooks/useTranslation';

function formatDate(ts, lang) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

export default function TournamentPicker() {
  const { tournaments, selectedTournament, selectTournament, setStep, logout, user } = useAppStore();
  const { loadEvents, eventsLoading, events } = useSets();
  const { t, language } = useTranslation();
  const [error, setError] = useState(null);

  async function handleSelect(tournament) {
    setError(null);
    selectTournament(tournament);
    try {
      await loadEvents(tournament);
      setStep(2); // Passe à l'étape Sets/Events
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="animate-fade-in-up px-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {t('tournament.title').split(' ')[0]} <span className="gradient-text">{t('tournament.title').split(' ').slice(1).join(' ')}</span>
          </h2>
          {user && (
            <p className="text-[var(--color-muted)] text-sm mt-1">
              {t('tournament.loggedInAs')} <strong className="text-white">{user.name}</strong>
              {' · '}{tournaments.length} {tournaments.length > 1 ? 'tournaments' : 'tournament'}
            </p>
          )}
        </div>
        <button
          onClick={logout}
          className="text-xs text-[var(--color-muted)] hover:text-white transition-colors border border-[var(--color-border)] px-3 py-1.5 rounded-lg hover:border-white/20"
        >
          {t('tournament.logout')}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm mb-6">
          <div className="font-semibold">{t('error.loading')}</div>
          <div className="opacity-80 text-xs mt-1 font-mono">{error}</div>
        </div>
      )}

      {tournaments.length === 0 ? (
        <div className="glass p-12 text-center text-[var(--color-muted)]">
          <div className="text-4xl mb-3">🏜️</div>
          <p>{t('tournament.noTournaments')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map(tData => {
            const logo = tData.images?.find(img => img.type === 'profile')?.url ?? tData.images?.[0]?.url ?? null;
            const isSelected = selectedTournament?.id === tData.id;
            const isLoading  = isSelected && eventsLoading;

            return (
              <button
                key={tData.id}
                id={`tournament-${tData.id}`}
                onClick={() => handleSelect(tData)}
                disabled={eventsLoading}
                className={`
                  glass text-left p-4 flex gap-4 items-start cursor-pointer
                  transition-all duration-200 hover:border-[var(--color-accent)]/50
                  hover:bg-white/5 active:scale-95 group
                  disabled:opacity-60 disabled:cursor-wait
                  ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : ''}
                `}
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-surface-2)] flex items-center justify-center">
                  {logo
                    ? <img src={logo} alt={tData.name} className="w-full h-full object-cover" />
                    : <span className="text-2xl">🏆</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                    {tData.name}
                  </h3>
                  <p className="text-[var(--color-muted)] text-xs mt-1">{formatDate(tData.startAt, language)}</p>
                  {tData.numAttendees && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                      👥 {tData.numAttendees}
                    </span>
                  )}
                </div>
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4 shrink-0 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : isSelected ? (
                  <span className="shrink-0 text-[var(--color-accent)] text-lg">✓</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
