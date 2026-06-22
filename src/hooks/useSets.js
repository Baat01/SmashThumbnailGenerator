import { useCallback } from 'react';
import { fetchTournamentEvents, fetchEventSets } from '../api/startgg';
import useAppStore from '../store/appStore';

/**
 * Hook gérant le chargement des events et sets Start.gg.
 * Toutes les données sont dans le store Zustand (partagées entre composants).
 *
 * Flux : tournoi sélectionné → loadEvents → (si 1 event: auto) → loadSetsForEvent → sets
 */
export function useSets() {
  const {
    apiKey,
    events, setEvents,
    setSets,
    setsLoading, setSetsLoading,
  } = useAppStore();

  // ── Étape A : charge les events du tournoi ──────────────────────────────
  const loadEvents = useCallback(async (tournament) => {
    if (!tournament?.slug) return;
    setSetsLoading(true); // on réutilise le flag de chargement global
    setEvents([]);
    setSets([]);

    try {
      const evs = await fetchTournamentEvents(apiKey, tournament.slug);
      setEvents(evs);

      // 1 seul event → on charge directement ses sets
      if (evs.length === 1) {
        await _fetchAndStoreSets(apiKey, evs[0], setSets);
      }
    } catch (err) {
      const msg = err?.response?.errors?.map(e => e.message).join(', ')
        ?? err?.message ?? 'Erreur inconnue';
      console.error('[useSets] loadEvents error:', err);
      throw new Error(`Impossible de charger les events : ${msg}`);
    } finally {
      setSetsLoading(false);
    }
  }, [apiKey, setEvents, setSets, setSetsLoading]);

  // ── Étape B : charge les sets d'un event choisi ─────────────────────────
  const loadSetsForEvent = useCallback(async (event) => {
    setSetsLoading(true);
    setSets([]);
    try {
      await _fetchAndStoreSets(apiKey, event, setSets);
    } finally {
      setSetsLoading(false);
    }
  }, [apiKey, setSets, setSetsLoading]);

  return { events, loadEvents, loadSetsForEvent };
}

// ── Fonction interne partagée ─────────────────────────────────────────────
async function _fetchAndStoreSets(apiKey, event, setSets) {
  const fetchedSets = await fetchEventSets(apiKey, event.id, event.name);
  const sorted = [...fetchedSets].sort((a, b) => Math.abs(b.round) - Math.abs(a.round));
  setSets(sorted);
  return sorted;
}
