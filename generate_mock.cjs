const fs = require('fs');

const players = {
  Bonane: { id: 1, chars: { Peach: 14 } },
  Dezarme: { id: 2, chars: { Kazuya: 85, MinMin: 81 } },
  juste_Geo: { id: 3, chars: { Pichu: 21, Ness: 11 } },
  'Métapol': { id: 4, chars: { Isabelle: 73 } },
  BOMIZ: { id: 5, chars: { Cloud: 65, 'Donkey Kong': 2 } },
  Blast: { id: 6, chars: { 'Pac-Man': 58, 'Mii Gunner': 56 } },
  'Spladzø': { id: 7, chars: { Cloud: 65 } },
  Baat01: { id: 8, chars: { 'Toon Link': 46 } },
  Rojojo: { id: 9, chars: { Palutena: 57, 'Donkey Kong': 2 } },
  ikaS: { id: 10, chars: { Rosalina: 51 } }
};

const scores = {
  'Baat01 vs Dezarme': [0, 3],
  'Baat01 vs BOMIZ': [3, 1],
  'Rojojo vs BOMIZ': [2, 3],
  'Rojojo vs Métapol': [0, 3],
  'BOMIZ vs juste_Geo': [0, 3],
  'Baat01 vs ikaS': [3, 0],
  'Rojojo vs Spladzø': [2, 1],
  'Blast vs Rojojo': [2, 0],
  'Bonane vs BOMIZ': [2, 0],
  'Spladzø vs Baat01': [2, 1],
  'Dezarme vs BOMIZ': [2, 1],
  'Rojojo vs Baat01': [2, 1]
};

const lines = `Bonane (Peach) vs Dezarme (Kazuya) - Pools - Sinj en cup #1
Bonane (Peach) vs juste_Geo (Pichu) - Pools - Sinj en cup #1
Bonane (Peach) vs Métapol (Isabelle) - Pools - Sinj en cup #1
Bonane (Peach) vs BOMIZ (Cloud) - Pools - Sinj en cup #1
juste_Geo (Pichu) vs Dezarme (Kazuya) - Pools - Sinj en cup #1
BOMIZ (Cloud) vs Dezarme (MinMin) - Pools - Sinj en cup #1
Métapol (Isabelle) vs Dezarme (MinMin) - Pools - Sinj en cup #1
Métapol (Isabelle) vs juste_Geo (Pichu) - Pools - Sinj en cup #1
BOMIZ (Cloud) vs juste_Geo (Pichu) - Pools - Sinj en cup #1
BOMIZ (Cloud) vs Métapol (Isabelle) - Pools - Sinj en cup #1
Blast (Pac-Man) vs Spladzø (Cloud) - Pools - Sinj en cup #1
Blast (Pac-Man) vs Baat01 (Toon Link) - Pools - Sinj en cup #1
Blast (Pac-Man) vs Rojojo (Palutena) - Pools - Sinj en cup #1
Blast (Mii Gunner) vs ikaS (Rosalina) - Pools - Sinj en cup #1
Baat01 (Toon Link) vs Spladzø (Cloud) - Pools - Sinj en cup #1
Rojojo (Palutena) vs Spladzø (Cloud) - Pools - Sinj en cup #1
ikaS (Rosalina) vs Spladzø (Cloud) - Pools - Sinj en cup #1
Baat01 (Toon Link) vs Rojojo (Palutena) - Pools - Sinj en cup #1
Baat01 (Toon Link) vs ikaS (Rosalina) - Pools - Sinj en cup #1
ikaS (Rosalina) vs Rojojo (Palutena) - Pools - Sinj en cup #1
Métapol (Isabelle) vs Rojojo (Palutena) - Winners Quarter-Final - Sinj en cup #1
Dezarme (MinMin) vs Spladzø (Cloud) - Winners Quarter-Final - Sinj en cup #1
BOMIZ (Donkey Kong) vs Rojojo (Donkey Kong) - Losers Round 1 - Sinj en cup #1
BOMIZ (Cloud) vs Baat01 (Toon Link) - Losers Round 2 - Sinj en cup #1
Dezarme (MinMin) vs Baat01 (Toon Link) - Losers Quarter-Final - Sinj en cup #1
Blast (Pac-Man) vs juste_Geo (Ness) - Winners Quarter-Final - Sinj en cup #1
juste_Geo (Ness) vs Spladzø (Cloud) - Losers Round 2 - Sinj en cup #1
Bonane (Peach) vs Spladzø (Cloud) - Losers Quarter-Final - Sinj en cup #1
Bonane (Peach) vs Métapol (Isabelle) - Winners Semi-Final - Sinj en cup #1
Blast (Pac-Man) vs Dezarme (MinMin) - Winners Semi-Final - Sinj en cup #1
Bonane (Peach) vs Dezarme (Kazuya) - Losers Semi-Final - Sinj en cup #1
Bonane (Peach) vs Métapol (Isabelle) - Losers Final - Sinj en cup #1
Bonane (Peach) vs Blast (Pac-Man) - Losers Final - Sinj en cup #1`.split('\n');

const mockSets = lines.map((line, i) => {
  const parts = line.split(' - ');
  const matchStr = parts[0];
  const roundStr = parts[1];
  
  const [p1Str, p2Str] = matchStr.split(' vs ');
  
  const parsePlayer = (str) => {
    const m = str.match(/(.+) \((.+)\)/);
    return { name: m[1].trim(), charStr: m[2].trim() };
  };
  
  const p1 = parsePlayer(p1Str);
  const p2 = parsePlayer(p2Str);
  
  const scoreKey1 = `${p1.name} vs ${p2.name}`;
  const scoreKey2 = `${p2.name} vs ${p1.name}`;
  let s1 = 2, s2 = 0;
  if (scores[scoreKey1]) { s1 = scores[scoreKey1][0]; s2 = scores[scoreKey1][1]; }
  else if (scores[scoreKey2]) { s1 = scores[scoreKey2][1]; s2 = scores[scoreKey2][0]; }
  
  return {
    id: 1000 + i,
    fullRoundText: roundStr,
    round: i + 1,
    winnerId: s1 > s2 ? players[p1.name].id : players[p2.name].id,
    state: 'COMPLETED',
    slots: [
      {
        standing: { stats: { score: { value: s1 } } },
        entrant: { id: players[p1.name].id, name: p1.name, participants: [{ player: { id: players[p1.name].id, gamerTag: p1.name } }] }
      },
      {
        standing: { stats: { score: { value: s2 } } },
        entrant: { id: players[p2.name].id, name: p2.name, participants: [{ player: { id: players[p2.name].id, gamerTag: p2.name } }] }
      }
    ],
    games: [
      {
        id: i * 10,
        orderNum: 1,
        selections: [
          { id: i*100+1, entrant: { id: players[p1.name].id }, character: { id: players[p1.name].chars[p1.charStr], name: p1.charStr } },
          { id: i*100+2, entrant: { id: players[p2.name].id }, character: { id: players[p2.name].chars[p2.charStr], name: p2.charStr } }
        ]
      }
    ]
  };
});

fs.writeFileSync('src/api/mockData.js', 'export const MOCK_SETS = ' + JSON.stringify(mockSets, null, 2) + ';');
