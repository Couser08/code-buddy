import { useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useEditorStore } from '../stores/editorStore';
import { useClassroomStore } from '../stores/classroomStore';
import { useAuthStore } from '../stores/authStore';
import { ClassroomRealtimeMessage, CodeBroadcastPayload, CursorTelemetryPayload, ExecutionBroadcastPayload } from '../types/realtime';
import { Doubt, Task } from '../types/database';
import { EnhancedExecutionResult } from '../lib/judge0';

export function useRealtimeSession(sessionId: string) {
  // Stable action selectors: Never causes re-render when state changes
  const setLiveCode = useEditorStore((s) => s.setLiveCode);
  const setCursorPosition = useEditorStore((s) => s.setCursorPosition);
  const setIsTeacherLive = useEditorStore((s) => s.setIsTeacherLive);
  const setTeacherExecution = useEditorStore((s) => s.setTeacherExecution);
  const setIsTeacherRunning = useEditorStore((s) => s.setIsTeacherRunning);

  const setOnlineCount = useClassroomStore((s) => s.setOnlineCount);
  const addDoubt = useClassroomStore((s) => s.addDoubt);
  const resolveDoubt = useClassroomStore((s) => s.resolveDoubt);
  const addTask = useClassroomStore((s) => s.addTask);

  const { user, profile, isAdmin } = useAuthStore();
  const channelRef = useRef<any>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorTelemetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBroadcastCursorRef = useRef<{ lineNumber: number; column: number } | null>(null);
  const lastBroadcastCodeRef = useRef<string>('');

  // Setup Realtime Synchronization:
  // 1. HTML5 BroadcastChannel: Ultra-fast local & cross-tab sync (<2ms)
  // 2. Storage Event Listener: Fallback ONLY if BroadcastChannel is unsupported
  // 3. Supabase Realtime Channel: Multi-user remote broadcasting across networks
  useEffect(() => {
    if (!sessionId) return;

    let bc: BroadcastChannel | null = null;
    let hasNativeBroadcastChannel = false;

    // 1. Initialize HTML5 BroadcastChannel for instantaneous cross-tab sync
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bcName = `codeclass_session_${sessionId}`;
        bc = new BroadcastChannel(bcName);
        broadcastChannelRef.current = bc;
        hasNativeBroadcastChannel = true;

        bc.onmessage = (event) => {
          const payload = event.data;
          if (!payload || !payload.type) return;

          switch (payload.type) {
            case 'code_broadcast': {
              setLiveCode(payload.code);
              if (payload.cursor) {
                setCursorPosition(payload.cursor);
              }
              break;
            }
            case 'cursor_telemetry': {
              setCursorPosition(payload.cursor);
              break;
            }
            case 'doubt_event': {
              if (payload.action === 'created') {
                addDoubt(payload.doubt);
              } else if (payload.action === 'resolved' || payload.action === 'replied') {
                resolveDoubt(payload.doubt.id, payload.doubt.admin_reply);
              }
              break;
            }
            case 'task_created': {
              addTask(payload.task);
              break;
            }
            case 'session_status': {
              setIsTeacherLive(payload.status === 'live');
              break;
            }
            case 'execution_broadcast': {
              setTeacherExecution(payload.output, payload.stdin);
              setIsTeacherRunning(payload.isRunning);
              break;
            }
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel initialization fallback:', e);
    }

    // 2. Storage Event Listener: ONLY active as fallback if BroadcastChannel is unsupported
    // Eliminates duplicate event loops and redundant disk reads
    const handleStorageChange = (e: StorageEvent) => {
      if (!hasNativeBroadcastChannel) {
        if (e.key === `codeclass_live_code_${sessionId}` || e.key === 'codeclass_live_code_global') {
          if (e.newValue && e.newValue !== useEditorStore.getState().liveCode) {
            setLiveCode(e.newValue);
          }
        }
      }
    };

    if (!hasNativeBroadcastChannel) {
      window.addEventListener('storage', handleStorageChange);
    }

    // 3. Hydrate initial snapshot from Supabase table for late-joiners
    const fetchInitialSnapshot = async () => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
      if (!isUUID || !isSupabaseConfigured) return;

      try {
        const { data, error } = await supabase
          .from('live_code_state')
          .select('code')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (data?.code && !error) {
          setLiveCode(data.code, true);
        }
      } catch (err) {
        console.warn('Could not fetch snapshot buffer:', err);
      }
    };
    fetchInitialSnapshot();

    // 4. Remote Supabase Realtime Channel (if configured)
    if (!isSupabaseConfigured) {
      setOnlineCount(87);
      setIsTeacherLive(true);

      return () => {
        if (bc) {
          bc.close();
          broadcastChannelRef.current = null;
        }
        if (!hasNativeBroadcastChannel) {
          window.removeEventListener('storage', handleStorageChange);
        }
      };
    }

    const channelName = `class:${sessionId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: user?.id || `anon-${Math.random().toString(36).substring(7)}` },
      },
    });

    // Listen for Remote Broadcast Events
    channel.on('broadcast', { event: 'classroom_message' }, ({ payload }: { payload: ClassroomRealtimeMessage }) => {
      switch (payload.type) {
        case 'code_broadcast': {
          setLiveCode(payload.code);
          if (payload.cursor) {
            setCursorPosition(payload.cursor);
          }
          break;
        }

        case 'cursor_telemetry': {
          setCursorPosition(payload.cursor);
          break;
        }

        case 'doubt_event': {
          if (payload.action === 'created') {
            addDoubt(payload.doubt);
          } else if (payload.action === 'resolved' || payload.action === 'replied') {
            resolveDoubt(payload.doubt.id, payload.doubt.admin_reply);
          }
          break;
        }

        case 'task_created': {
          addTask(payload.task);
          break;
        }

        case 'session_status': {
          setIsTeacherLive(payload.status === 'live');
          break;
        }

        case 'execution_broadcast': {
          setTeacherExecution(payload.output, payload.stdin);
          setIsTeacherRunning(payload.isRunning);
          break;
        }
      }
    });

    // Presence Tracking
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const totalUsers = Object.keys(presenceState).length;
        setOnlineCount(Math.max(totalUsers, 1));
      })
      .on('presence', { event: 'join' }, () => {
        const presenceState = channel.presenceState();
        setOnlineCount(Math.max(Object.keys(presenceState).length, 1));
      })
      .on('presence', { event: 'leave' }, () => {
        const presenceState = channel.presenceState();
        setOnlineCount(Math.max(Object.keys(presenceState).length, 1));
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user?.id || 'guest',
          name: profile?.name || 'Student',
          email: user?.email || '',
          role: isAdmin ? 'admin' : 'student',
          avatar_url: profile?.avatar_url,
          online_at: new Date().toISOString(),
        });
      }
    });

    channelRef.current = channel;

    return () => {
      if (bc) {
        bc.close();
        broadcastChannelRef.current = null;
      }
      if (!hasNativeBroadcastChannel) {
        window.removeEventListener('storage', handleStorageChange);
      }
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (cursorTelemetryTimerRef.current) clearTimeout(cursorTelemetryTimerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [sessionId, user?.id, isAdmin, profile?.name, profile?.avatar_url, user?.email, setLiveCode, setCursorPosition, setIsTeacherLive, setTeacherExecution, setIsTeacherRunning, setOnlineCount, addDoubt, resolveDoubt, addTask]);

  // Tick-Rate Collaborative Netcode: 100ms batched broadcasts
  const broadcastCode = useCallback((code: string, cursor?: { lineNumber: number; column: number }) => {
    // 1. Update in-memory store (asynchronously queues debounced disk write)
    setLiveCode(code);

    // 2. Broadcast immediately to local tabs via BroadcastChannel (<2ms)
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'code_broadcast',
          code,
          language_id: 50,
          cursor,
          timestamp: Date.now(),
        });
      } catch (e) {}
    }

    // 3. Debounce remote network broadcast to ~100ms ticks (10Hz tick rate budget)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (code === lastBroadcastCodeRef.current) return;
      lastBroadcastCodeRef.current = code;

      const payload: CodeBroadcastPayload = {
        type: 'code_broadcast',
        code,
        language_id: 50,
        cursor,
        timestamp: Date.now(),
      };

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'classroom_message',
          payload,
        });
      }

      // Upsert into live_code_state for late-joiners
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
      if (isSupabaseConfigured && isUUID) {
        try {
          await supabase
            .from('live_code_state')
            .upsert({
              session_id: sessionId,
              code,
              language_id: 50,
              updated_at: new Date().toISOString(),
            });
        } catch (err) {}
      }
    }, 100);
  }, [sessionId, setLiveCode]);

  // Delta-Checked Cursor Telemetry (Throttled to 100ms)
  const broadcastCursor = useCallback((cursor: { lineNumber: number; column: number }) => {
    // Skip if cursor hasn't actually moved
    if (
      lastBroadcastCursorRef.current &&
      lastBroadcastCursorRef.current.lineNumber === cursor.lineNumber &&
      lastBroadcastCursorRef.current.column === cursor.column
    ) {
      return;
    }
    lastBroadcastCursorRef.current = cursor;

    setCursorPosition(cursor);

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'cursor_telemetry',
          cursor,
          timestamp: Date.now(),
        });
      } catch (e) {}
    }

    if (!channelRef.current) return;
    if (cursorTelemetryTimerRef.current) return;

    cursorTelemetryTimerRef.current = setTimeout(() => {
      cursorTelemetryTimerRef.current = null;
      if (channelRef.current) {
        const payload: CursorTelemetryPayload = {
          type: 'cursor_telemetry',
          cursor,
          timestamp: Date.now(),
        };

        channelRef.current.send({
          type: 'broadcast',
          event: 'classroom_message',
          payload,
        });
      }
    }, 100);
  }, [setCursorPosition]);

  // Broadcast Doubt Event
  const broadcastDoubtEvent = useCallback((doubt: Doubt, action: 'created' | 'resolved' | 'replied') => {
    if (action === 'created') addDoubt(doubt);
    if (action === 'resolved') resolveDoubt(doubt.id, doubt.admin_reply);

    const doubtMsg = {
      type: 'doubt_event',
      action,
      doubt,
    };

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(doubtMsg);
      } catch (e) {}
    }

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'classroom_message',
        payload: doubtMsg,
      });
    }
  }, [addDoubt, resolveDoubt]);

  // Broadcast Task Event
  const broadcastTaskCreated = useCallback((task: Task) => {
    addTask(task);

    const taskMsg = {
      type: 'task_created',
      task,
    };

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(taskMsg);
      } catch (e) {}
    }

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'classroom_message',
        payload: taskMsg,
      });
    }
  }, [addTask]);

  // Broadcast Code Execution Event
  const broadcastExecution = useCallback(
    (output: EnhancedExecutionResult | null, stdin: string, isRunning: boolean) => {
      setTeacherExecution(output, stdin);
      setIsTeacherRunning(isRunning);

      const payload: ExecutionBroadcastPayload = {
        type: 'execution_broadcast',
        output,
        stdin,
        isRunning,
        executedBy: user?.user_metadata?.full_name || user?.email || 'Instructor',
        timestamp: Date.now(),
      };

      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(payload);
        } catch (e) {}
      }

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'classroom_message',
          payload,
        });
      }
    },
    [setTeacherExecution, setIsTeacherRunning, user]
  );

  return {
    broadcastCode,
    broadcastCursor,
    broadcastDoubtEvent,
    broadcastTaskCreated,
    broadcastExecution,
  };
}
