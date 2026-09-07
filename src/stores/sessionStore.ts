// Unified sessionStore facade (Maintained for full backward-compatibility)
// Internally delegates to modular domain stores:
// - useEditorStore: high-frequency live code, cursor telemetry, debounced disk I/O
// - useClassroomStore: low-frequency relational entities (doubts, tasks, submissions)
// - usePerformanceStore: Lite Mode, low-spec hardware detection

export { useEditorStore } from './editorStore';
export { useClassroomStore } from './classroomStore';
export { usePerformanceStore } from './performanceStore';

import { useEditorStore, EditorState } from './editorStore';
import { useClassroomStore, ClassroomState } from './classroomStore';

export type CombinedSessionState = EditorState & ClassroomState;

export interface SessionStoreHook {
  (): CombinedSessionState;
  <T>(selector: (state: CombinedSessionState) => T): T;
  getState: () => CombinedSessionState;
}

export const useSessionStore: SessionStoreHook = Object.assign(
  function <T>(selector?: (state: CombinedSessionState) => T): T | CombinedSessionState {
    const editor = useEditorStore();
    const classroom = useClassroomStore();

    const combined: CombinedSessionState = {
      ...editor,
      ...classroom,
    };

    if (selector) {
      return selector(combined);
    }
    return combined;
  },
  {
    getState: (): CombinedSessionState => ({
      ...useEditorStore.getState(),
      ...useClassroomStore.getState(),
    }),
  }
);
