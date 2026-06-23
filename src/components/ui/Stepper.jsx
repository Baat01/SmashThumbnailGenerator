import { useTranslation } from '../../hooks/useTranslation';

/**
 * Stepper — Indicateur d'étapes horizontal.
 * 4 étapes : Auth → Tournoi → Sets → Génération
 */
const STEPS_CONFIG = [
  { key: 'step.apiKey',     icon: '🔑' },
  { key: 'step.tournament', icon: '🏆' },
  { key: 'step.sets',       icon: '⚔️' },
  { key: 'step.generation', icon: '🎨' },
];

export default function Stepper({ currentStep }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-0 mb-10 px-4">
      {STEPS_CONFIG.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive    = index === currentStep;
        const isUpcoming  = index > currentStep;

        return (
          <div key={index} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm
                  font-semibold transition-all duration-300 relative
                  ${isCompleted
                    ? 'bg-[var(--color-accent)] text-white shadow-lg'
                    : isActive
                      ? 'bg-[var(--color-accent)] text-white animate-pulse-glow'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]'
                  }
                `}
              >
                {isCompleted ? '✓' : step.icon}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap transition-colors duration-300
                  ${isActive ? 'text-[var(--color-accent)]' : isCompleted ? 'text-white' : 'text-[var(--color-muted)]'}`}
              >
                {t(step.key)}
              </span>
            </div>

            {/* Connector */}
            {index < STEPS.length - 1 && (
              <div
                className={`step-connector mx-2 mb-5 ${isCompleted ? 'active' : ''}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
