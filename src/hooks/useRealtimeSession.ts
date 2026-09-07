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
  const debounceTimerRef = useRef<any>(null);
  const rafUpdateRef = useRef<number | null>(null);

  // Setup Realtime Channel scoped strictly as `class:{sessionId}`
  useEffect(() => {
    if (!sessionId) return;

    const channelName = `class:${sessionId}`;

    if (!isSupabaseConfigured) {
      // Local development simulation of presence
      setOnlineCount(87);
      setIsTeacherLive(true);
      return;
    }

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: user?.id || `anon-${Math.random().toString(36).substring(7)}` },
      },
    });

    // 1. Listen for Broadcast Events with Message Type Discriminator
    channel.on('broadcast', { event: 'classroom_message' }, ({ payload }: { payload: ClassroomRealtimeMessage }) => {
      switch (payload.type) {
        case 'code_broadcast': {
          // Game-Dev Netcode Optimization: Batch updates using requestAnimationFrame
          if (rafUpdateRef.current) {
            cancelAnimationFrame(rafUpdateRef.current);
          }
          rafUpdateRef.current = requestAnimationFrame(() => {
            setLiveCode(payload.code);
            if (payload.cursor) {
              setCursorPosition(payload.cursor);
            }
          });
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

    // 2. Presence Tracking (Live students counter & avatar stack)
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const totalUsers = Object.keys(presenceState).length;
        setOnlineCount(Math.max(totalUsers, 1));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const presenceState = channel.presenceState();
        setOnlineCount(Object.keys(presenceState).length);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const presenceState = channel.presenceState();
        setOnlineCount(Object.keys(presenceState).length);
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

    // Fetch initial live code snapshot from live_code_state table for late-joiners
    const fetchInitialSnapshot = async () => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
      if (!isUUID || !isSupabaseConfigured) return;

      try {
        const { data, error } = await supabase
          .from('live_code_state')
          .select('code')
          .eq('session_id', sessionId)
          .single();

        if (data?.code && !error) {
          setLiveCode(data.code);
        }
      } catch (err) {
        console.warn('Could not fetch snapshot buffer:', err);
      }
    };
    fetchInitialSnapshot();

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (rafUpdateRef.current) cancelAnimationFrame(rafUpdateRef.current);
      if (cursorTelemetryTimerRef.current) clearTimeout(cursorTelemetryTimerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [sessionId, user?.id, isAdmin, profile?.name, profile?.avatar_url, user?.email]);

  const cursorTelemetryTimerRef = useRef<any>(null);

  // Teacher Broadcast Code: Debounced 200ms
  const broadcastCode = useCallback((code: string, cursor?: { lineNumber: number; column: number }) => {
    // 1. Immediately update local store
    setLiveCode(code);

    // 2. Debounce high-frequency network broadcasts
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

      // Upsert into live_code_state for late-joiners if Supabase is active and sessionId is UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
      if (isSupabaseConfigured && isUUID) {
        await supabase
          .from('live_code_state')
          .upsert({
            session_id: sessionId,
            code,
            language_id: 50,
            updated_at: new Date().toISOString(),
          });
      }
    }, 200); // 200ms debounce
  }, [sessionId, setLiveCode]);

  // Teacher Broadcast Cursor Telemetry (Throttled to 80ms)
  const broadcastCursor = useCallback((cursor: { lineNumber: number; column: number }) => {
    setCursorPosition(cursor);
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

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'classroom_message',
        payload: {
          type: 'doubt_event',
          action,
          doubt,
        },
      });
    }
  }, [addDoubt, resolveDoubt]);

  // Broadcast Task Event
  const broadcastTaskCreated = useCallback((task: Task) => {
    addTask(task);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'classroom_message',
        payload: {
          type: 'task_created',
          task,
        },
      });
    }
  }, [addTask]);

  // Broadcast Code Execution Event (syncs terminal & stdin live across classroom)
  const broadcastExecution = useCallback(
    (output: EnhancedExecutionResult | null, stdin: string, isRunning: boolean) => {
      setTeacherExecution(output, stdin);
      setIsTeacherRunning(isRunning);

      if (channelRef.current) {
        const payload: ExecutionBroadcastPayload = {
          type: 'execution_broadcast',
          output,
          stdin,
          isRunning,
          executedBy: user?.user_metadata?.full_name || user?.email || 'Instructor',
          timestamp: Date.now(),
        };

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
