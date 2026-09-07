import { create } from 'zustand';
import { INITIAL_C_CODE } from '../lib/constants';
import { EnhancedExecutionResult } from '../lib/judge0';

export interface EditorState {
  liveCode: string;
  cursorPosition: { lineNumber: number; column: number } | null;
  isTeacherLive: boolean;
  teacherExecution: EnhancedExecutionResult | null;
  teacherStdin: string;
  isTeacherRunning: boolean;

  setLiveCode: (code: string, immediateDisk?: boolean) => void;
  setCursorPosition: (pos: { lineNumber: number; column: number } | null) => void;
  setIsTeacherLive: (isLive: boolean) => void;
  setTeacherExecution: (output: EnhancedExecutionResult | null, stdin: string) => void;
  setIsTeacherRunning: (isRunning: boolean) => void;
  resetLiveCodeToDefault: () => void;
  flushDiskBuffer: () => void;
}

const DEFAULT_SESSION_ID = '00000000-0000-0000-0000-000000000001';

const getInitialLiveCode = (): string => {
  try {
    const sessionSaved = localStorage.getItem(`codeclass_live_code_${DEFAULT_SESSION_ID}`);
    if (sessionSaved && sessionSaved.trim()) return sessionSaved;

    const globalSaved = localStorage.getItem('codeclass_live_code_global');
    if (globalSaved && globalSaved.trim()) return globalSaved;
  } catch {
    // LocalStorage unavailable guard
  }
  return INITIAL_C_CODE;
};

// Asynchronous Debounced Disk Persistence Manager
// Eliminates synchronous disk I/O stalls on low-end storage
let diskDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingCodeToWrite: string | null = null;

const persistCodeToDisk = (code: string) => {
  try {
    localStorage.setItem('codeclass_live_code_global', code);
    localStorage.setItem(`codeclass_live_code_${DEFAULT_SESSION_ID}`, code);
    pendingCodeToWrite = null;
  } catch {}
};

const scheduleDiskWrite = (code: string, immediate = false) => {
  pendingCodeToWrite = code;

  if (immediate) {
    if (diskDebounceTimer) {
      clearTimeout(diskDebounceTimer);
      diskDebounceTimer = null;
    }
    persistCodeToDisk(code);
    return;
  }

  if (diskDebounceTimer) {
    clearTimeout(diskDebounceTimer);
  }

  // 800ms idle timer: only writes to disk when typing pauses
  diskDebounceTimer = setTimeout(() => {
    diskDebounceTimer = null;
    persistCodeToDisk(code);
  }, 800);
};

// Ensure any dirty buffer is saved before the window unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (pendingCodeToWrite !== null) {
      persistCodeToDisk(pendingCodeToWrite);
    }
  });
}

export const useEditorStore = create<EditorState>((set) => ({
  liveCode: getInitialLiveCode(),
  cursorPosition: { lineNumber: 4, column: 12 },
  isTeacherLive: true,
  teacherExecution: null,
  teacherStdin: '',
  isTeacherRunning: false,

  setLiveCode: (code, immediateDisk = false) => {
    scheduleDiskWrite(code, immediateDisk);
    set({ liveCode: code });
  },

  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setIsTeacherLive: (isLive) => set({ isTeacherLive: isLive }),
  setTeacherExecution: (output, stdin) => set({ teacherExecution: output, teacherStdin: stdin }),
  setIsTeacherRunning: (isRunning) => set({ isTeacherRunning: isRunning }),

  resetLiveCodeToDefault: () => {
    if (diskDebounceTimer) {
      clearTimeout(diskDebounceTimer);
      diskDebounceTimer = null;
    }
    try {
      localStorage.removeItem('codeclass_live_code_global');
      localStorage.removeItem(`codeclass_live_code_${DEFAULT_SESSION_ID}`);
    } catch {}
    set({ liveCode: INITIAL_C_CODE });
  },

  flushDiskBuffer: () => {
    if (pendingCodeToWrite !== null) {
      persistCodeToDisk(pendingCodeToWrite);
    }
  },
}));
