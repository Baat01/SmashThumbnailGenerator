import useAppStore from '../store/appStore';
import { translations } from '../locales/translations';

export function useTranslation() {
  const language = useAppStore(state => state.language);

  const t = (key, variables = {}) => {
    // Récupérer le dictionnaire pour la langue actuelle (fallback fr)
    const dict = translations[language] || translations['fr'];
    let text = dict[key];

    // Si la clé n'existe pas, on retourne la clé elle-même
    if (text === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    // Remplacer les variables du type {nom}
    for (const [varName, varValue] of Object.entries(variables)) {
      text = text.replace(new RegExp(`{${varName}}`, 'g'), varValue);
    }

    return text;
  };

  return { t, language };
}
