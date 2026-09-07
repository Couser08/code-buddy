export type UserRole = 'admin' | 'student';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface ClassSession {
  id: string;
  title: string;
  description?: string;
  status: 'live' | 'ended';
  teacher_id: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface LiveCodeState {
  session_id: string;
  code: string;
  language_id: number;
  updated_at: string;
}

export interface Doubt {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  message: string;
  status: 'open' | 'resolved';
  admin_reply?: string;
  created_at: string;
}

export interface Task {
  id: string;
  session_id: string;
  title: string;
  description: string;
  initial_code: string;
  language_id: number;
  created_at: string;
}

export interface Submission {
  id: string;
  task_id: string;
  student_id: string;
  student_name?: string;
  code: string;
  judge0_output?: Judge0ExecutionResult | null;
  status: 'pending' | 'reviewed';
  teacher_feedback?: string;
  score?: number;
  submitted_at: string;
}

export interface Judge0ExecutionResult {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  status?: {
    id: number;
    description: string;
  };
}
