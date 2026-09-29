import { create } from 'zustand';

export type DoctorTitle = 'Dr.' | 'Dra.';

export interface DoctorProfile {
  title: DoctorTitle;
  /** Last name only — e.g. "Pinheiro" */
  lastName: string;
  /** Convenience: "Dr. Pinheiro" | "Dra. Pinheiro" */
  fullTitle: string;
  /** True once the onboarding flow has been completed */
  hasCompletedOnboarding: boolean;
}

interface DoctorStoreState extends DoctorProfile {
  setDoctorProfile: (title: DoctorTitle, lastName: string) => void;
  completeOnboarding: () => void;
  resetDoctor: () => void;
}

const INITIAL_STATE: DoctorProfile = {
  title: 'Dr.',
  lastName: '',
  fullTitle: '',
  hasCompletedOnboarding: false,
};

export const useDoctorStore = create<DoctorStoreState>((set) => ({
  ...INITIAL_STATE,

  setDoctorProfile: (title, lastName) => {
    const trimmed = lastName.trim();
    set({
      title,
      lastName: trimmed,
      fullTitle: trimmed ? `${title} ${trimmed}` : title,
    });
  },

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  resetDoctor: () => set({ ...INITIAL_STATE }),
}));
