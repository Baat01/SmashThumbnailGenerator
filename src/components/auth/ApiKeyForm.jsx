import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

export default function ApiKeyForm() {
  const { login, loading, error } = useAuth();
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [showKey, setShowKey] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim()) login(value);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up px-4">

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-4xl font-bold mb-3 gradient-text">
          {t('app.title')}
        </h1>
        <p className="text-[var(--color-muted)] text-lg max-w-md">
          {t('auth.description1')}
          <strong className="text-white">Start.gg</strong>
          {t('auth.description2')}
        </p>
      </div>

      {/* Card */}
      <div className="glass p-8 w-full max-w-md glow-accent transition-all duration-300">
        <h2 className="text-xl font-semibold mb-1 text-white">{t('auth.submit')}</h2>
        <p className="text-[var(--color-muted)] text-sm mb-6">
          {t('auth.helpTitle')}{' '}
          <a
            href="https://developer.start.gg/docs/authentication"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            developer.start.gg
          </a>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Input clé API */}
          <div className="relative">
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-2 uppercase tracking-wider">
              {t('auth.label')}
            </label>
            <div className="relative flex items-center">
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={t('auth.placeholder')}
                autoComplete="off"
                className="
                  w-full bg-[var(--color-surface-2)] border border-[var(--color-border)]
                  rounded-lg px-4 py-3 pr-12 text-white placeholder-[var(--color-muted)]
                  focus:outline-none focus:border-[var(--color-accent)]
                  focus:ring-1 focus:ring-[var(--color-accent)]
                  transition-all duration-200 font-mono text-sm
                "
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-[var(--color-muted)] hover:text-white transition-colors"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm">
              <div className="font-semibold">{t('auth.error')}</div>
              <div className="opacity-80 text-xs mt-1 font-mono">{error}</div>
            </div>
          )}

          {/* Submit */}
          <button
            id="api-key-submit"
            type="submit"
            disabled={loading || !value.trim()}
            className="
              w-full py-3 px-6 rounded-lg font-semibold text-white
              bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)]
              hover:opacity-90 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t('auth.loading')}
              </>
            ) : (
              `🚀 ${t('auth.submit')}`
            )}
          </button>
        </form>
      </div>

      {/* Footer info */}
      <p className="text-[var(--color-muted)] text-xs mt-6 text-center">
        {t('auth.storageInfo')}
      </p>
    </div>
  );
}
