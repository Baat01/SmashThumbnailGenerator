import { useState } from 'react';
import { fetchUserTournaments } from '../api/startgg';
import useAppStore from '../store/appStore';

/**
 * Hook gérant l'authentification Start.gg.
 * Valide la clé API en appelant l'endpoint et en récupérant l'utilisateur.
 */
export function useAuth() {
  const { apiKey, setApiKey, setUser, setTournaments, setStep } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function login(key) {
    setLoading(true);
    setError(null);
    try {
      const { user, tournaments } = await fetchUserTournaments(key.trim());
      setApiKey(key.trim());
      setUser(user);
      setTournaments(tournaments);
      setStep(1); // Passe à l'étape Tournoi
    } catch (err) {
      const msg = err?.response?.errors?.[0]?.message
        || err?.message
        || 'Erreur inconnue';
      setError(`Authentification échouée : ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return { apiKey, loading, error, login };
}
