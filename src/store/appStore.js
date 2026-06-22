import { create } from 'zustand';

/**
 * Store global Zustand.
 * Gère l'état de l'application à travers les 4 étapes.
 */
const useAppStore = create((set, get) => ({
  // ── Step navigation ──────────────────────────────────────────────
  currentStep: 0, // 0=Auth, 1=Tournoi, 2=Sets, 3=Génération
  setStep: (step) => set({ currentStep: step }),

  // ── Auth ─────────────────────────────────────────────────────────
  apiKey: localStorage.getItem('startgg_api_key') || '',
  user: null,
  setApiKey: (key) => {
    localStorage.setItem('startgg_api_key', key);
    set({ apiKey: key });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('startgg_api_key');
    set({ apiKey: '', user: null, currentStep: 0, selectedTournament: null, sets: [], selectedSets: [] });
  },

  // ── Tournament ───────────────────────────────────────────────────
  tournaments: [],
  selectedTournament: null,
  setTournaments: (tournaments) => set({ tournaments }),
  selectTournament: (tournament) => set({ selectedTournament: tournament, sets: [], selectedSets: [], events: [] }),

  // ── Events (sous-niveaux du tournoi) ────────────────────────────
  events: [],
  setEvents: (events) => set({ events }),

  // ── Sets ─────────────────────────────────────────────────────────
  sets: [],
  selectedSets: [],     // sets cochés pour génération
  setsLoading: false,
  setSets: (sets) => set({ sets }),
  setSetsLoading: (v) => set({ setsLoading: v }),
  toggleSetSelection: (setId) => {
    const { selectedSets } = get();
    const exists = selectedSets.includes(setId);
    set({ selectedSets: exists ? selectedSets.filter(id => id !== setId) : [...selectedSets, setId] });
  },
  selectAllSets: () => {
    const { sets } = get();
    set({ selectedSets: sets.map(s => s.id) });
  },
  clearSetSelection: () => set({ selectedSets: [] }),

  // ── Character overrides (fallback manuel) ────────────────────────
  // { [setId]: { p1CharId, p2CharId } }
  characterOverrides: {},
  setCharacterOverride: (setId, slot, charId) => {
    const { characterOverrides } = get();
    set({
      characterOverrides: {
        ...characterOverrides,
        [setId]: {
          ...(characterOverrides[setId] || {}),
          [slot]: charId,
        },
      },
    });
  },

  // ── Layout template (JSON exporté par SmashThumbnailGenerator) ──────────
  layoutTemplate: null,
  layoutTemplateName: '',
  setLayoutTemplate: (template, name) => set({ layoutTemplate: template, layoutTemplateName: name }),
  clearLayoutTemplate: () => set({ layoutTemplate: null, layoutTemplateName: '' }),

  // ── Generation ───────────────────────────────────────────────────
  isGenerating: false,
  generatedCount: 0,
  setIsGenerating: (v) => set({ isGenerating: v }),
  setGeneratedCount: (n) => set({ generatedCount: n }),
}));

export default useAppStore;
