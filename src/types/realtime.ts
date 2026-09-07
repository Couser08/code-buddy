import { Doubt, Task } from './database';
import { EnhancedExecutionResult } from '../lib/judge0';

export type RealtimeMessageType =
  | 'code_broadcast'
  | 'cursor_telemetry'
  | 'doubt_event'
  | 'task_created'
  | 'session_status'
  | 'execution_broadcast';

export interface CodeBroadcastPayload {
  type: 'code_broadcast';
  code: string;
  language_id: number;
  cursor?: {
    lineNumber: number;
    column: number;
  };
  timestamp: number;
}

export interface CursorTelemetryPayload {
  type: 'cursor_telemetry';
  cursor: {
    lineNumber: number;
    column: number;
  };
  selection?: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  timestamp: number;
}

export interface DoubtEventPayload {
  type: 'doubt_event';
  action: 'created' | 'resolved' | 'replied';
  doubt: Doubt;
}

export interface TaskCreatedPayload {
  type: 'task_created';
  task: Task;
}

export interface SessionStatusPayload {
  type: 'session_status';
  status: 'live' | 'ended';
  ended_at?: string;
}

export interface ExecutionBroadcastPayload {
  type: 'execution_broadcast';
  output: EnhancedExecutionResult | null;
  stdin: string;
  isRunning: boolean;
  executedBy?: string;
  timestamp: number;
}

export type ClassroomRealtimeMessage =
  | CodeBroadcastPayload
  | CursorTelemetryPayload
  | DoubtEventPayload
  | TaskCreatedPayload
  | SessionStatusPayload
  | ExecutionBroadcastPayload;

export interface ClassroomPresenceState {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  avatar_url?: string;
  online_at: string;
}
