import { GraphQLClient } from 'graphql-request';

const STARTGG_ENDPOINT = 'https://api.start.gg/gql/alpha';

export function createClient(apiKey) {
  return new GraphQLClient(STARTGG_ENDPOINT, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUÊTE 1 : Tournois de l'utilisateur connecté
// ─────────────────────────────────────────────────────────────────────────────
export const GET_USER_TOURNAMENTS = `
  query GetUserTournaments {
    currentUser {
      id
      name
      slug
      tournaments(query: {
        perPage: 25
        page: 1
        filter: { upcoming: false }
      }) {
        nodes {
          id
          name
          slug
          startAt
          numAttendees
          images { url type }
        }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// REQUÊTE 2a : Events d'un tournoi (slug)
// ─────────────────────────────────────────────────────────────────────────────
export const GET_TOURNAMENT_EVENTS = `
  query GetTournamentEvents($slug: String!) {
    tournament(slug: $slug) {
      id
      name
      events {
        id
        name
        numEntrants
        state
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// REQUÊTE 2b : Sets d'un event (par eventId, paginé)
// ─────────────────────────────────────────────────────────────────────────────
export const GET_EVENT_SETS = `
  query GetEventSets($eventId: ID!, $page: Int!) {
    event(id: $eventId) {
      id
      name
      sets(
        page: $page
        perPage: 20
        sortType: STANDARD
      ) {
        pageInfo {
          total
          totalPages
        }
        nodes {
          id
          fullRoundText
          round
          winnerId
          state
          slots {
            standing {
              stats {
                score { value }
              }
            }
            entrant {
              id
              name
              participants {
                player {
                  id
                  gamerTag
                }
              }
            }
          }
          games {
            id
            orderNum
            selections {
              id
              entrant {
                id
              }
              character {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Détermine le personnage le plus utilisé par chaque entrant dans un set.
 * En cas d'ex-æquo, retourne le premier rencontré (par ordre de partie).
 *
 * @param {object} set  Nœud de set avec games[].selections[]
 * @returns {Map<number, {id, name}>}  entrantId → character
 */
function computeCharactersFromGames(set) {
  const charCount = new Map(); // entrantId → Map<charId → {count, character}>

  const sortedGames = [...(set.games ?? [])].sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));

  for (const game of sortedGames) {
    for (const sel of (game.selections ?? [])) {
      const eid  = sel.entrant?.id;
      const char = sel.character;
      if (!eid || !char) continue;

      if (!charCount.has(eid)) charCount.set(eid, new Map());
      const byChar = charCount.get(eid);
      const prev   = byChar.get(char.id) ?? { count: 0, character: char };
      byChar.set(char.id, { count: prev.count + 1, character: char });
    }
  }

  // Pour chaque entrant, trouve le personnage le plus joué
  const result = new Map();
  for (const [entrantId, byChar] of charCount.entries()) {
    let best = null;
    for (const { count, character } of byChar.values()) {
      if (!best || count > best.count) best = { count, character };
    }
    if (best) result.set(entrantId, best.character);
  }

  return result;
}

/**
 * Vérifie la clé API et récupère les tournois de l'utilisateur.
 */
export async function fetchUserTournaments(apiKey) {
  const client = createClient(apiKey);
  const data = await client.request(GET_USER_TOURNAMENTS);
  const user = data?.currentUser;
  if (!user) throw new Error('Clé API invalide ou droits insuffisants.');
  return { user, tournaments: user.tournaments?.nodes ?? [] };
}

/**
 * Étape 1 : Récupère les events d'un tournoi.
 * Normalise le slug (retire le préfixe "tournament/" si présent).
 */
export async function fetchTournamentEvents(apiKey, slug) {
  const client = createClient(apiKey);

  const normalizedSlug = slug.startsWith('tournament/')
    ? slug.replace(/^tournament\//, '')
    : slug;

  console.log('[startgg] fetchTournamentEvents — slug:', normalizedSlug);

  const data = await client.request(GET_TOURNAMENT_EVENTS, { slug: normalizedSlug });
  const tournament = data?.tournament;

  if (!tournament) {
    throw new Error(`Tournoi introuvable pour le slug "${normalizedSlug}"`);
  }

  console.log('[startgg] Events trouvés:', tournament.events?.length ?? 0, tournament.events);
  return tournament.events ?? [];
}

/**
 * Étape 2 : Récupère tous les sets d'un event (toutes les pages),
 * filtre côté client pour ne garder que les sets avec un winner.
 */
export async function fetchEventSets(apiKey, eventId, eventName) {
  const client = createClient(apiKey);
  let allSets = [];

  console.log(`[startgg] fetchEventSets — eventId: ${eventId} (${eventName})`);

  const firstPage = await client.request(GET_EVENT_SETS, { eventId, page: 1 });
  const eventData = firstPage?.event;

  if (!eventData) {
    console.warn('[startgg] Event introuvable pour id:', eventId);
    return [];
  }

  const { pageInfo, nodes } = eventData.sets;
  console.log(`[startgg] Page 1/${pageInfo.totalPages} — ${nodes.length} sets, total: ${pageInfo.total}`);

  allSets = nodes.map(s => ({ ...s, eventName }));

  for (let p = 2; p <= pageInfo.totalPages; p++) {
    const nextPage = await client.request(GET_EVENT_SETS, { eventId, page: p });
    const pageNodes = nextPage?.event?.sets?.nodes ?? [];
    console.log(`[startgg] Page ${p}/${pageInfo.totalPages} — ${pageNodes.length} sets`);
    allSets = [...allSets, ...pageNodes.map(s => ({ ...s, eventName }))];
  }

  console.log(`[startgg] Total sets bruts pour "${eventName}":`, allSets.length);
  console.log('[startgg] États des sets:', [...new Set(allSets.map(s => s.state))]);

  // Un set est terminé si winnerId est défini
  const completedSets = allSets.filter(s => s.winnerId != null);
  console.log(`[startgg] Sets complétés (winnerId non null):`, completedSets.length);

  // Enrichissement : détection des personnages via games.selections
  const enrichedSets = completedSets.map(set => {
    const charMap = computeCharactersFromGames(set);
    return {
      ...set,
      slots: set.slots.map(slot => ({
        ...slot,
        detectedCharacter: charMap.get(slot.entrant?.id) ?? null,
      })),
    };
  });

  return enrichedSets;
}

/**
 * Fonction principale : récupère tous les sets complétés de tous les events d'un tournoi.
 */
export async function fetchTournamentSets(apiKey, slug) {
  const events = await fetchTournamentEvents(apiKey, slug);

  if (events.length === 0) {
    console.warn('[startgg] Aucun event trouvé pour ce tournoi.');
    return { sets: [], events: [] };
  }

  let allSets = [];
  for (const event of events) {
    const eventSets = await fetchEventSets(apiKey, event.id, event.name);
    allSets = [...allSets, ...eventSets];
  }

  console.log('[startgg] Total sets complétés (tous events confondus):', allSets.length);
  return { sets: allSets, events };
}

/**
 * Récupère les phases d'un événement.
 */
export const GET_EVENT_PHASES = `
  query GetEventPhases($eventId: ID!) {
    event(id: $eventId) {
      id
      name
      phases {
        id
        name
        bracketType
        phaseGroups(query: { page: 1, perPage: 8 }) {
          nodes {
            id
            displayIdentifier
            wave { identifier }
          }
        }
      }
    }
  }
`;

export async function fetchEventPhases(apiKey, eventId) {
  const client = createClient(apiKey);
  const data = await client.request(GET_EVENT_PHASES, { eventId });
  return data?.event?.phases ?? [];
}
