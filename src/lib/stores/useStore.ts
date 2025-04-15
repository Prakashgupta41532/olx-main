import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

interface LanguageState {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
}

interface OnboardingState {
  step: number;
  setStep: (step: number) => void;
  completed: boolean;
  setCompleted: (completed: boolean) => void;
}

interface Store extends LocationState, LanguageState, OnboardingState {}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Location
      selectedLocation: 'Toronto, ON',
      setSelectedLocation: (location) => set({ selectedLocation: location }),

      // Language
      selectedLanguage: 'en',
      setSelectedLanguage: (language) => set({ selectedLanguage: language }),

      // Onboarding
      step: 1,
      setStep: (step) => set({ step }),
      completed: false,
      setCompleted: (completed) => set({ completed }),
    }),
    {
      name: 'marketplace-store',
    }
  )
);