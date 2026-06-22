import { GraphQLClient } from 'graphql-request';

const STARTGG_ENDPOINT = 'https://api.start.gg/gql/alpha';

/**
 * Crée un client GraphQL authentifié avec le token Bearer fourni.
 */
export function createClient(apiKey) {
  return new GraphQLClient(STARTGG_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
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
          images {
            url
            type
          }
        }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// REQUÊTE 2 : Sets complétés d'un tournoi (avec pagination)
// ─────────────────────────────────────────────────────────────────────────────
export const GET_TOURNAMENT_SETS = `
  query GetTournamentSets($slug: String!, $page: Int!) {
    tournament(slug: $slug) {
      id
      name
      events {
        id
        name
        sets(
          page: $page
          perPage: 30
          filters: { state: 3 }
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
            slots {
              standing {
                stats {
                  score {
                    value
                  }
                }
              }
              entrant {
                id
                name
                participants {
                  player {
                    id
                    gamerTag
                    user {
                      slug
                      images {
                        url
                        type
                      }
                    }
                  }
                  selections {
                    selectionValue
                    entrant {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// REQUÊTE 3 : Phases d'un événement
// ─────────────────────────────────────────────────────────────────────────────
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
            wave {
              identifier
            }
          }
        }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS DE REQUÊTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vérifie la clé API et récupère les tournois de l'utilisateur.
 * @returns {{ user, tournaments }}
 */
export async function fetchUserTournaments(apiKey) {
  const client = createClient(apiKey);
  const data = await client.request(GET_USER_TOURNAMENTS);
  const user = data?.currentUser;
  if (!user) throw new Error('Clé API invalide ou droits insuffisants.');
  const tournaments = user.tournaments?.nodes ?? [];
  return { user, tournaments };
}

/**
 * Récupère tous les sets complétés d'un tournoi (toutes les pages).
 * @returns {{ sets, eventId, eventName }}
 */
export async function fetchTournamentSets(apiKey, slug) {
  const client = createClient(apiKey);
  let allSets = [];
  let eventId = null;
  let eventName = null;

  const firstPage = await client.request(GET_TOURNAMENT_SETS, { slug, page: 1 });
  const events = firstPage?.tournament?.events ?? [];

  for (const event of events) {
    const { pageInfo, nodes } = event.sets;
    eventId = event.id;
    eventName = event.name;
    allSets = [...allSets, ...nodes.map(s => ({ ...s, eventName: event.name }))];

    // Pagination automatique si plusieurs pages
    for (let p = 2; p <= pageInfo.totalPages; p++) {
      const nextPage = await client.request(GET_TOURNAMENT_SETS, { slug, page: p });
      const nextEvent = nextPage?.tournament?.events?.find(e => e.id === event.id);
      if (nextEvent) {
        allSets = [...allSets, ...nextEvent.sets.nodes.map(s => ({ ...s, eventName: event.name }))];
      }
    }
  }

  return { sets: allSets, eventId, eventName };
}

/**
 * Récupère les phases d'un événement.
 * @returns {Phase[]}
 */
export async function fetchEventPhases(apiKey, eventId) {
  const client = createClient(apiKey);
  const data = await client.request(GET_EVENT_PHASES, { eventId });
  return data?.event?.phases ?? [];
}
