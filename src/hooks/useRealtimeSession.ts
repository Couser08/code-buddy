import { useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';
import { ClassroomRealtimeMessage, CodeBroadcastPayload, CursorTelemetryPayload, ExecutionBroadcastPayload } from '../types/realtime';
import { Doubt, Task } from '../types/database';
import { EnhancedExecutionResult } from '../lib/judge0';

export function useRealtimeSession(sessionId: string) {
  const {
    setLiveCode,
    setCursorPosition,
    setOnlineCount,
    setIsTeacherLive,
    addDoubt,
    resolveDoubt,
    addTask,
    setTeacherExecution,
    setIsTeacherRunning,
  } = useSessionStore();

  const { user, profile, isAdmin } = useAuthStore();
  const channelRef = useRef<any>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const debounceTimerRef = useRef<any>(null);
  const cursorTelemetryTimerRef = useRef<any>(null);

  // Setup Realtime Synchronization:
  // 1. HTML5 BroadcastChannel: Ultra-fast local & cross-tab sync (<2ms)
  // 2. Storage Event Listener: Synchronous reload / tab backup
  // 3. Supabase Realtime Channel: Multi-user remote broadcasting across networks
  useEffect(() => {
    if (!sessionId) return;

    // 1. Initialize HTML5 BroadcastChannel for instantaneous cross-tab sync
    const bcName = `codeclass_session_${sessionId}`;
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(bcName);
        broadcastChannelRef.current = bc;

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

    // 2. Local Storage Event Listener (secondary cross-tab sync fallback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `codeclass_live_code_${sessionId}` || e.key === 'codeclass_live_code_global') {
        if (e.newValue && e.newValue !== useSessionStore.getState().liveCode) {
          setLiveCode(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Hydrate immediately from localStorage on component mount
    const fetchInitialSnapshot = async () => {
      try {
        const localCode = localStorage.getItem(`codeclass_live_code_${sessionId}`) ||
                          localStorage.getItem('codeclass_live_code_global');
        if (localCode && localCode.trim()) {
          setLiveCode(localCode);
        }
      } catch (e) {}

      // Fetch initial live code snapshot from Supabase table for remote late-joiners
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
      if (!isUUID || !isSupabaseConfigured) return;

      try {
        const { data, error } = await supabase
          .from('live_code_state')
          .select('code')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (data?.code && !error) {
          setLiveCode(data.code);
          try {
            localStorage.setItem(`codeclass_live_code_${sessionId}`, data.code);
            localStorage.setItem('codeclass_live_code_global', data.code);
          } catch (e) {}
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
        window.removeEventListener('storage', handleStorageChange);
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
          // Update store directly without requestAnimationFrame delay (to support background tabs)
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

    // Subscribe to channel and track presence
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
      window.removeEventListener('storage', handleStorageChange);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (cursorTelemetryTimerRef.current) clearTimeout(cursorTelemetryTimerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [sessionId, user?.id, isAdmin, profile?.name, profile?.avatar_url, user?.email]);

  // Teacher Broadcast Code: Instant local & BroadcastChannel + Debounced 150ms network
  const broadcastCode = useCallback((code: string, cursor?: { lineNumber: number; column: number }) => {
    // 1. Immediately update local store
    setLiveCode(code);

    // 2. Instantly broadcast across local tabs/windows (<2ms)
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

    // 3. Immediately persist to localStorage for instant reload / hard refresh persistence
    try {
      localStorage.setItem(`codeclass_live_code_${sessionId}`, code);
      localStorage.setItem('codeclass_live_code_global', code);
    } catch (e) {}

    // 4. Debounce remote network broadcast (150ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
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

      // Upsert into live_code_state for remote late-joiners
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
        } catch (err) {
          // Graceful fallback if RLS or foreign key is not yet migrated
        }
      }
    }, 150);
  }, [sessionId, setLiveCode]);

  // Teacher Broadcast Cursor Telemetry (Throttled to 80ms)
  const broadcastCursor = useCallback((cursor: { lineNumber: number; column: number }) => {
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
    }, 80);
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

  // Broadcast Code Execution Event (syncs terminal & stdin live across classroom)
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
