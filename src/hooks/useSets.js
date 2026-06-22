import { useState, useCallback } from 'react';
import { fetchTournamentSets } from '../api/startgg';
import useAppStore from '../store/appStore';

/**
 * Hook pour récupérer et gérer les sets d'un tournoi sélectionné.
 */
export function useSets() {
  const {
    apiKey,
    selectedTournament,
    sets,
    setSets,
    setsLoading,
    setSetsLoading,
  } = useAppStore();
  const [error, setError] = useState(null);

  const loadSets = useCallback(async (tournament) => {
    if (!tournament?.slug) return;
    setSetsLoading(true);
    setError(null);
    try {
      const { sets: fetchedSets } = await fetchTournamentSets(apiKey, tournament.slug);
      // Tri : du plus récent au plus ancien (round DESC)
      const sorted = [...fetchedSets].sort((a, b) => Math.abs(b.round) - Math.abs(a.round));
      setSets(sorted);
    } catch (err) {
      const msg = err?.response?.errors?.[0]?.message || err?.message || 'Erreur inconnue';
      setError(`Impossible de charger les sets : ${msg}`);
    } finally {
      setSetsLoading(false);
    }
  }, [apiKey, setSets, setSetsLoading]);

  return {
    sets,
    loading: setsLoading,
    error,
    loadSets,
  };
}
