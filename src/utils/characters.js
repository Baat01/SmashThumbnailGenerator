/**
 * Liste complète des personnages de Super Smash Bros. Ultimate.
 * Les IDs correspondent aux selectionValue renvoyés par l'API Start.gg.
 *
 * Structure : { id, name, slug }
 * Slug correspond au chemin dans les assets de personnages existants.
 */
export const CHARACTERS = [
  { id: 1,  name: 'Mario',           slug: 'mario' },
  { id: 2,  name: 'Donkey Kong',     slug: 'donkey' },
  { id: 3,  name: 'Link',            slug: 'link' },
  { id: 4,  name: 'Samus',           slug: 'samus' },
  { id: 5,  name: 'Dark Samus',      slug: 'samusd' },
  { id: 6,  name: 'Yoshi',           slug: 'yoshi' },
  { id: 7,  name: 'Kirby',           slug: 'kirby' },
  { id: 8,  name: 'Fox',             slug: 'fox' },
  { id: 9,  name: 'Pikachu',         slug: 'pikachu' },
  { id: 10, name: 'Luigi',           slug: 'luigi' },
  { id: 11, name: 'Ness',            slug: 'ness' },
  { id: 12, name: 'Captain Falcon',  slug: 'captain' },
  { id: 13, name: 'Jigglypuff',      slug: 'jigglypuff' },
  { id: 14, name: 'Peach',           slug: 'peach' },
  { id: 15, name: 'Daisy',           slug: 'daisy' },
  { id: 16, name: 'Bowser',          slug: 'bowser' },
  { id: 17, name: 'Ice Climbers',    slug: 'ices' },
  { id: 18, name: 'Sheik',           slug: 'sheik' },
  { id: 19, name: 'Zelda',           slug: 'zelda' },
  { id: 20, name: 'Dr. Mario',       slug: 'mariod' },
  { id: 21, name: 'Pichu',           slug: 'pichu' },
  { id: 22, name: 'Falco',           slug: 'falco' },
  { id: 23, name: 'Marth',           slug: 'marth' },
  { id: 24, name: 'Lucina',          slug: 'lucina' },
  { id: 25, name: 'Young Link',      slug: 'ylink' },
  { id: 26, name: 'Ganondorf',       slug: 'ganondorf' },
  { id: 27, name: 'Mewtwo',          slug: 'mewtwo' },
  { id: 28, name: 'Roy',             slug: 'roy' },
  { id: 29, name: 'Chrom',           slug: 'chrom' },
  { id: 30, name: 'Mr. Game & Watch',slug: 'gamewatch' },
  { id: 31, name: 'Meta Knight',     slug: 'metaknight' },
  { id: 32, name: 'Pit',             slug: 'pit' },
  { id: 33, name: 'Dark Pit',        slug: 'pitd' },
  { id: 34, name: 'Zero Suit Samus', slug: 'samusz' },
  { id: 35, name: 'Wario',           slug: 'wario' },
  { id: 36, name: 'Snake',           slug: 'snake' },
  { id: 37, name: 'Ike',             slug: 'ike' },
  { id: 38, name: 'Pokémon Trainer', slug: 'ptrainer' },
  { id: 39, name: 'Diddy Kong',      slug: 'diddy' },
  { id: 40, name: 'Lucas',           slug: 'lucas' },
  { id: 41, name: 'Sonic',           slug: 'sonic' },
  { id: 42, name: 'King Dedede',     slug: 'dedede' },
  { id: 43, name: 'Olimar',          slug: 'pikmin' },
  { id: 44, name: 'Lucario',         slug: 'lucario' },
  { id: 45, name: 'R.O.B.',          slug: 'rob' },
  { id: 46, name: 'Toon Link',       slug: 'tlink' },
  { id: 47, name: 'Wolf',            slug: 'wolf' },
  { id: 48, name: 'Villager',        slug: 'villager' },
  { id: 49, name: 'Mega Man',        slug: 'megaman' },
  { id: 50, name: 'Wii Fit Trainer', slug: 'wiifit' },
  { id: 51, name: 'Rosalina',        slug: 'rosalina' },
  { id: 52, name: 'Little Mac',      slug: 'littlemac' },
  { id: 53, name: 'Greninja',        slug: 'greninja' },
  { id: 54, name: 'Mii Brawler',     slug: 'miibrawler' },
  { id: 55, name: 'Mii Swordfighter',slug: 'miisword' },
  { id: 56, name: 'Mii Gunner',      slug: 'miigunner' },
  { id: 57, name: 'Palutena',        slug: 'palutena' },
  { id: 58, name: 'Pac-Man',         slug: 'pacman' },
  { id: 59, name: 'Robin',           slug: 'robin' },
  { id: 60, name: 'Shulk',           slug: 'shulk' },
  { id: 61, name: 'Bowser Jr.',      slug: 'bowserjr' },
  { id: 62, name: 'Duck Hunt',       slug: 'duckhunt' },
  { id: 63, name: 'Ryu',             slug: 'ryu' },
  { id: 64, name: 'Ken',             slug: 'ken' },
  { id: 65, name: 'Cloud',           slug: 'cloud' },
  { id: 66, name: 'Corrin',          slug: 'corrin' },
  { id: 67, name: 'Bayonetta',       slug: 'bayonetta' },
  { id: 68, name: 'Inkling',         slug: 'inkling' },
  { id: 69, name: 'Ridley',          slug: 'ridley' },
  { id: 70, name: 'Simon',           slug: 'simon' },
  { id: 71, name: 'Richter',         slug: 'richter' },
  { id: 72, name: 'King K. Rool',    slug: 'krool' },
  { id: 73, name: 'Isabelle',        slug: 'isabelle' },
  { id: 74, name: 'Incineroar',      slug: 'incineroar' },
  { id: 75, name: 'Piranha Plant',   slug: 'piranha' },
  { id: 76, name: 'Joker',           slug: 'joker' },
  { id: 77, name: 'Hero',            slug: 'hero' },
  { id: 78, name: 'Banjo & Kazooie', slug: 'banjo' },
  { id: 79, name: 'Terry',           slug: 'terry' },
  { id: 80, name: 'Byleth',          slug: 'byleth' },
  { id: 81, name: 'Min Min',         slug: 'minmin' },
  { id: 82, name: 'Steve',           slug: 'steve' },
  { id: 83, name: 'Sephiroth',       slug: 'edge' },
  { id: 84, name: 'Pyra & Mythra',   slug: 'pyra' },
  { id: 85, name: 'Kazuya',          slug: 'kazuya' },
  { id: 86, name: 'Sora',            slug: 'trail' },
];

/** Map rapide : id → character */
export const CHARACTER_MAP = Object.fromEntries(
  CHARACTERS.map(c => [c.id, c])
);

/**
 * Récupère le personnage depuis le tableau `selections` d'un slot Start.gg.
 * Les selections sont maintenant au niveau du slot (pas du participant).
 *
 * @param {Array}  selections  - slot.selections[]
 * @param {string} entrantId   - l'id de l'entrant du slot
 * @returns {Character|null}
 */
export function getCharacterFromSelections(selections, entrantId) {
  if (!selections || selections.length === 0) return null;

  // On cherche une sélection de type CHARACTER pour cet entrant
  const sel = selections.find(
    s => s?.selectionType === 'CHARACTER' && s?.entrant?.id === entrantId
  );

  // Fallback : si une seule sélection sans filtre d'entrant
  const fallback = !sel && selections.find(s => s?.selectionType === 'CHARACTER');
  const target = sel ?? fallback;

  if (!target?.selectionValue) return null;
  return CHARACTER_MAP[target.selectionValue] ?? null;
}

/**
 * Extrait le tag principal d'un entrant (premier participant).
 */
export function getPlayerTag(entrant) {
  return entrant?.participants?.[0]?.player?.gamerTag
    ?? entrant?.name
    ?? '???';
}

/**
 * Détermine si un set est en Winners ou Losers bracket.
 */
export function getBracketSide(round) {
  if (round === null || round === undefined) return '';
  return round > 0 ? 'W' : 'L';
}
