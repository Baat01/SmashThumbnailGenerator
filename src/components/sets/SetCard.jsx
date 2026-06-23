import useAppStore from '../../store/appStore';
import { getPlayerTag, CHARACTER_MAP } from '../../utils/characters';
import CharacterPicker from './CharacterPicker';

/**
 * Carte représentant un set complété.
 * Affiche les deux joueurs, leur personnage (API ou fallback manuel),
 * le score et la phase du tournoi.
 */
export default function SetCard({ set }) {
  const { selectedSets, toggleSetSelection, characterOverrides, setCharacterOverride } = useAppStore();
  const isSelected = selectedSets.includes(set.id);

  const slot1 = set.slots?.[0];
  const slot2 = set.slots?.[1];
  const entrant1 = slot1?.entrant;
  const entrant2 = slot2?.entrant;

  const p1Tag = getPlayerTag(entrant1);
  const p2Tag = getPlayerTag(entrant2);

  const score1 = slot1?.standing?.stats?.score?.value ?? '-';
  const score2 = slot2?.standing?.stats?.score?.value ?? '-';

  // Personnages depuis l'API (calculés via games.selections)
  const apiChar1 = slot1?.detectedCharacter ?? null;
  const apiChar2 = slot2?.detectedCharacter ?? null;

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
          {set.fullRoundText ?? `Round ${set.round}`}
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
      <div className="flex items-center gap-2 mb-3">
        {/* Joueur 1 */}
        <div className={`flex-1 text-center ${isWinner1 ? 'text-[var(--color-winner)]' : 'text-[var(--color-loser)]'}`}>
          <div className="font-bold text-sm truncate">{p1Tag}</div>
          {char1 && <div className="text-xs text-[var(--color-muted)] mt-0.5">{char1.name}</div>}
          {isWinner1 && <div className="text-[10px] font-semibold text-[var(--color-winner)] mt-0.5">WINNER</div>}
        </div>

        {/* Score */}
        <div className="flex flex-col items-center shrink-0">
          <div className="text-white font-bold text-lg">{score1} – {score2}</div>
          <div className="text-[var(--color-muted)] text-[10px] font-bold uppercase tracking-wider">VS</div>
        </div>

        {/* Joueur 2 */}
        <div className={`flex-1 text-center ${isWinner2 ? 'text-[var(--color-winner)]' : 'text-[var(--color-loser)]'}`}>
          <div className="font-bold text-sm truncate">{p2Tag}</div>
          {char2 && <div className="text-xs text-[var(--color-muted)] mt-0.5">{char2.name}</div>}
          {isWinner2 && <div className="text-[10px] font-semibold text-[var(--color-winner)] mt-0.5">WINNER</div>}
        </div>
      </div>

      {/* Fallback : sélection manuelle des persos */}
      {needsFallback && (
        <div
          className="border-t border-[var(--color-border)] pt-3 mt-1 flex flex-col gap-2"
          onClick={e => e.stopPropagation()} // Empêche le toggle de sélection
        >
          <p className="text-[10px] text-[var(--color-muted)] text-center uppercase tracking-wider">
            ⚠️ Personnages non reportés — sélection manuelle
          </p>
          <div className="flex gap-2">
            {needsChar1 && (
              <CharacterPicker
                id={`char-p1-${set.id}`}
                label={p1Tag}
                value={characterOverrides[set.id]?.p1CharId ?? null}
                onChange={(charId) => setCharacterOverride(set.id, 'p1CharId', charId)}
              />
            )}
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
      )}
    </div>
  );
}
