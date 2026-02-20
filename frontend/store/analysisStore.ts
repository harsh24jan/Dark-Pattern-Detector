import { create } from 'zustand';

interface DetectedIssue {
  issue: string;
  description: string;
}

interface SignalBreakdown {
  visual: number;
  semantic: number;
  effort: number;
  default: number;
  pressure: number;
}

interface Analysis {
  id: string;
  dpi_score: number;
  risk_level: string;
  simple_summary: string;
  detected_issues: DetectedIssue[];
  signal_breakdown: SignalBreakdown;
  timestamp: string;
  language: string;
  screenshot?: string;
}

interface AnalysisStore {
  currentAnalysis: Analysis | null;
  history: Analysis[];
  language: 'en' | 'hi' | 'hinglish';
  setCurrentAnalysis: (analysis: Analysis) => void;
  setHistory: (history: Analysis[]) => void;
  setLanguage: (language: 'en' | 'hi' | 'hinglish') => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  currentAnalysis: null,
  history: [],
  language: 'en',
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setHistory: (history) => set({ history }),
  setLanguage: (language) => set({ language }),
}));