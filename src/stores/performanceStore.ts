import { create } from 'zustand';

interface PerformanceState {
  isLiteMode: boolean;
  isLowSpecDevice: boolean;
  toggleLiteMode: () => void;
  setLiteMode: (enabled: boolean) => void;
}

// Auto-detect whether client hardware is considered low-spec
// Criteria: <= 4 logical CPU cores, <= 4GB RAM, or user-preference
const detectLowSpecDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const nav = window.navigator as any;
    const lowCores = nav.hardwareConcurrency && nav.hardwareConcurrency <= 4;
    const lowMemory = nav.deviceMemory && nav.deviceMemory <= 4;
    const isMobileTouch = 'ontouchstart' in window && window.innerWidth < 768;

    return Boolean(lowCores || lowMemory || isMobileTouch);
  } catch {
    return false;
  }
};

const getInitialLiteMode = (): boolean => {
  try {
    const saved = localStorage.getItem('codeclass_lite_mode');
    if (saved !== null) {
      return saved === 'true';
    }
  } catch {
    // LocalStorage fallback
  }
  return detectLowSpecDevice();
};

export const usePerformanceStore = create<PerformanceState>((set) => ({
  isLiteMode: getInitialLiteMode(),
  isLowSpecDevice: detectLowSpecDevice(),
  toggleLiteMode: () =>
    set((state) => {
      const next = !state.isLiteMode;
      try {
        localStorage.setItem('codeclass_lite_mode', String(next));
      } catch {}
      return { isLiteMode: next };
    }),
  setLiteMode: (enabled: boolean) => {
    try {
      localStorage.setItem('codeclass_lite_mode', String(enabled));
    } catch {}
    set({ isLiteMode: enabled });
  },
}));
