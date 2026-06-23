import { CHARACTERS } from '../../utils/characters';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Menu déroulant de sélection de personnage (fallback manuel).
 * Affiché quand l'API Start.gg ne remonte pas les sélections.
 */
export default function CharacterPicker({ value, onChange, label, id }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs text-[var(--color-muted)] font-medium text-center truncate">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
        className="
          bg-[var(--color-surface-2)] border border-[var(--color-border)]
          text-white text-xs rounded-lg px-3 py-2
          focus:outline-none focus:border-[var(--color-accent)]
          cursor-pointer transition-colors duration-200
          appearance-none text-center
        "
      >
        <option value="">{t('sets.chooseChar')}</option>
        {CHARACTERS.map(char => (
          <option key={char.id} value={char.id}>
            {char.name}
          </option>
        ))}
      </select>
    </div>
  );
}
