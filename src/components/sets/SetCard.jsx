import useAppStore from '../../store/appStore';
import { getPlayerTag, CHARACTER_MAP, CHARACTER_NAME_MAP } from '../../utils/characters';
import CharacterPicker from './CharacterPicker';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Carte représentant un set complété.
 * Affiche les deux joueurs, leur personnage (API ou fallback manuel),
 * le score et la phase du tournoi.
 */
export default function SetCard({ set }) {
  const { selectedSets, toggleSetSelection, characterOverrides, setCharacterOverride } = useAppStore();
  const { t } = useTranslation();
  const isSelected = selectedSets.includes(set.id);

  const slot1 = set.slots?.[0];
  const slot2 = set.slots?.[1];
  const entrant1 = slot1?.entrant;
  const entrant2 = slot2?.entrant;

  const p1Tag = getPlayerTag(entrant1);
  const p2Tag = getPlayerTag(entrant2);

  const score1 = slot1?.standing?.stats?.score?.value ?? '-';
  const score2 = slot2?.standing?.stats?.score?.value ?? '-';

  // Helper pour résoudre le personnage retourné par l'API (gère ID mock ou ID global Start.gg)
  const resolveCharacter = (apiChar) => {
    if (!apiChar) return null;
    // Si l'ID matche directement (ex: mock data)
    if (CHARACTER_MAP[apiChar.id]) return CHARACTER_MAP[apiChar.id];
    // Sinon on tente de faire correspondre par le nom (Start.gg renvoie un nom exact en string)
    if (apiChar.name && CHARACTER_NAME_MAP[apiChar.name.toLowerCase()]) {
      return CHARACTER_NAME_MAP[apiChar.name.toLowerCase()];
    }
    // Fallback: on renvoie l'objet brut qui ne contiendra probablement pas de slug, l'image ne chargera pas
    return apiChar;
  };

  // Personnages depuis l'API (calculés via games.selections)
  const apiChar1 = resolveCharacter(slot1?.detectedCharacters?.[0]);
  const apiChar2 = resolveCharacter(slot2?.detectedCharacters?.[0]);

  // Override manuel depuis le store
  const override1 = characterOverrides[set.id]?.p1CharId
    ? CHARACTER_MAP[characterOverrides[set.id].p1CharId]
    : null;
  const override2 = characterOverrides[set.id]?.p2CharId
    ? CHARACTER_MAP[characterOverrides[set.id].p2CharId]
    : null;

  const char1 = override1 ?? apiChar1;
  const char2 = override2 ?? apiChar2;

  const needsChar1 = !char1;
  const needsChar2 = !char2;
  const needsFallback = needsChar1 || needsChar2;

  const isWinner1 = set.winnerId === entrant1?.id;
  const isWinner2 = set.winnerId === entrant2?.id;

  return (
    <div
      id={`set-card-${set.id}`}
      className={`
        glass p-4 transition-all duration-200 cursor-pointer
        hover:bg-white/5 select-none
        ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5' : ''}
      `}
      onClick={() => toggleSetSelection(set.id)}
    >
      {/* Header : phase + checkbox */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-accent)]">
          {set.fullRoundText ?? `${t('sets.round')} ${set.round}`}
        </span>
        <div className={`
          w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
          ${isSelected
            ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
            : 'border-[var(--color-border)]'
          }
        `}>
          {isSelected && <span className="text-white text-xs font-bold">✓</span>}
        </div>
      </div>

      {/* Players VS */}
      <div className="flex items-start gap-2 mb-3">
        {/* Joueur 1 */}
        <div className={`flex-1 flex flex-col items-center text-center min-w-0 ${isWinner1 ? 'text-[var(--color-winner)]' : 'text-[var(--color-loser)]'}`}>
          <div className="h-8 mb-1 flex items-end justify-center">
            {char1 && (
              <img 
                src={`https://raw.githubusercontent.com/Kekwel/ThumbnailGeneratorAssets/main/games/ult/stock/${char1.slug}.png`} 
                alt={char1.name} 
                className="w-8 h-8 object-contain drop-shadow-md"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
          <div className="font-bold text-sm truncate w-full">{p1Tag}</div>
          <div className="h-4 mt-0.5 flex items-center justify-center">
            {char1 && <div className="text-xs text-[var(--color-muted)] truncate px-1 max-w-full">{char1.name}</div>}
          </div>
          <div className="h-4 mt-0.5 flex items-start justify-center">
            {isWinner1 && <div className="text-[10px] font-semibold text-[var(--color-winner)]">{t('sets.winner')}</div>}
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center justify-start shrink-0 w-16 mt-9">
          <div className="text-white font-bold text-lg leading-none mb-1">{score1} – {score2}</div>
          <div className="text-[var(--color-muted)] text-[10px] font-bold uppercase tracking-wider">{t('sets.vs')}</div>
        </div>

        {/* Joueur 2 */}
        <div className={`flex-1 flex flex-col items-center text-center min-w-0 ${isWinner2 ? 'text-[var(--color-winner)]' : 'text-[var(--color-loser)]'}`}>
          <div className="h-8 mb-1 flex items-end justify-center">
            {char2 && (
              <img 
                src={`https://raw.githubusercontent.com/Kekwel/ThumbnailGeneratorAssets/main/games/ult/stock/${char2.slug}.png`} 
                alt={char2.name} 
                className="w-8 h-8 object-contain drop-shadow-md"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
          <div className="font-bold text-sm truncate w-full">{p2Tag}</div>
          <div className="h-4 mt-0.5 flex items-center justify-center">
            {char2 && <div className="text-xs text-[var(--color-muted)] truncate px-1 max-w-full">{char2.name}</div>}
          </div>
          <div className="h-4 mt-0.5 flex items-start justify-center">
            {isWinner2 && <div className="text-[10px] font-semibold text-[var(--color-winner)]">{t('sets.winner')}</div>}
          </div>
        </div>
      </div>

      {/* Fallback : sélection manuelle des persos */}
      {needsFallback && (
        <div
          className="border-t border-[var(--color-border)] pt-3 mt-1 flex flex-col gap-2"
          onClick={e => e.stopPropagation()} // Empêche le toggle de sélection
        >
          <p className="text-[10px] text-[var(--color-muted)] text-center uppercase tracking-wider">
            {t('sets.manualSelection')}
          </p>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              {needsChar1 && (
                <CharacterPicker
                  id={`char-p1-${set.id}`}
                  label={p1Tag}
                  value={characterOverrides[set.id]?.p1CharId ?? null}
                  onChange={(charId) => setCharacterOverride(set.id, 'p1CharId', charId)}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {needsChar2 && (
                <CharacterPicker
                  id={`char-p2-${set.id}`}
                  label={p2Tag}
                  value={characterOverrides[set.id]?.p2CharId ?? null}
                  onChange={(charId) => setCharacterOverride(set.id, 'p2CharId', charId)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
