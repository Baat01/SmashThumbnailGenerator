import useAppStore from './store/appStore';
import { useTranslation } from './hooks/useTranslation';
import Stepper from './components/ui/Stepper';
import ApiKeyForm from './components/auth/ApiKeyForm';
import TournamentPicker from './components/tournament/TournamentPicker';
import SetList from './components/sets/SetList';
import ThumbnailPreview from './components/thumbnail/ThumbnailPreview';

export default function App() {
  const { currentStep, apiKey, language, setLanguage } = useAppStore();
  const { t } = useTranslation();

  function renderStep() {
    switch (currentStep) {
      case 0: return <ApiKeyForm />;
      case 1: return <TournamentPicker />;
      case 2: return <SetList />;
      case 3: return <ThumbnailPreview />;
      default: return <ApiKeyForm />;
    }
  }

  function toggleLanguage() {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Bar ── */}
      <header
        className="glass border-b border-[var(--color-border)] px-6 py-4 flex items-center gap-4"
        style={{ borderRadius: 0 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎮</span>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">
              {t('app.title')}
            </h1>
            <p className="text-[var(--color-muted)] text-xs">{t('app.by')}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Sélecteur de langue */}
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center w-12 h-7 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-muted)] hover:text-white hover:border-[var(--color-accent)] transition-all uppercase"
            aria-label="Changer la langue"
          >
            {language}
          </button>

          {/* Badge statut connexion */}
          {apiKey && (
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="text-green-400 font-medium">{t('app.connected')}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col py-10 px-4">
        {/* Stepper (affiché uniquement après auth) */}
        {currentStep > 0 && <Stepper currentStep={currentStep - 1} />}

        {/* Page active */}
        <div className="flex-1 flex flex-col">
          {renderStep()}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-4 text-[var(--color-muted)] text-xs border-t border-[var(--color-border)]">
        {t('app.footer.basedOn')}{' '}
        <a
          href="https://github.com/Kekwel/SmashThumbnailGenerator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] hover:underline"
        >
          SmashThumbnailGenerator
        </a>
        {' '}{t('app.footer.byOriginal')}{' '}
        {t('app.footer.dataProvidedBy')}{' '}
        <a
          href="https://start.gg"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] hover:underline"
        >
          Start.gg
        </a>
      </footer>
    </div>
  );
}
