import { create } from 'zustand';
import { ClassSession, Doubt, Task, Submission } from '../types/database';
import { INITIAL_C_CODE } from '../lib/constants';
import { EnhancedExecutionResult } from '../lib/judge0';

interface SessionState {
  currentSession: ClassSession | null;
  liveCode: string;
  cursorPosition: { lineNumber: number; column: number } | null;
  onlineCount: number;
  isTeacherLive: boolean;
  doubts: Doubt[];
  tasks: Task[];
  submissions: Submission[];
  activeTask: Task | null;
  teacherExecution: EnhancedExecutionResult | null;
  teacherStdin: string;
  isTeacherRunning: boolean;

  setCurrentSession: (session: ClassSession | null) => void;
  setLiveCode: (code: string) => void;
  setCursorPosition: (pos: { lineNumber: number; column: number } | null) => void;
  setOnlineCount: (count: number) => void;
  setIsTeacherLive: (isLive: boolean) => void;
  setDoubts: (doubts: Doubt[]) => void;
  addDoubt: (doubt: Doubt) => void;
  resolveDoubt: (doubtId: string, reply?: string) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  setActiveTask: (task: Task | null) => void;
  setSubmissions: (submissions: Submission[]) => void;
  addSubmission: (submission: Submission) => void;
  updateSubmission: (submissionId: string, feedback: string, score: number) => void;
  setTeacherExecution: (output: EnhancedExecutionResult | null, stdin: string) => void;
  setIsTeacherRunning: (isRunning: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSession: {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Introduction to C Programming: Basics, Syntax and Your First Program',
    description: 'Master variables, memory concepts, GCC compilation flags, and write your first Hello World in C.',
    status: 'live',
    teacher_id: '00000000-0000-0000-0000-000000000000',
    started_at: new Date(Date.now() - 36 * 60 * 1000).toISOString(), // started 36 mins ago
    created_at: new Date().toISOString(),
  },
  liveCode: INITIAL_C_CODE,
  cursorPosition: { lineNumber: 4, column: 12 },
  onlineCount: 87,
  isTeacherLive: true,
  doubts: [
    {
      id: 'd-1',
      session_id: '00000000-0000-0000-0000-000000000001',
      student_id: 's-1',
      student_name: 'Sarah Chen',
      student_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      message: 'Why do we return 0 from main()? What happens if we return 1?',
      status: 'open',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'd-2',
      session_id: '00000000-0000-0000-0000-000000000001',
      student_id: 's-2',
      student_name: 'Alex Rivera',
      student_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      message: 'Is #include <stdio.h> a function call or a preprocessor directive?',
      status: 'resolved',
      admin_reply: 'It is a preprocessor directive! The compiler copies stdio.h prototypes before actual compilation begins.',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'd-3',
      session_id: '00000000-0000-0000-0000-000000000001',
      student_id: 's-3',
      student_name: 'Elena Rostova',
      student_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      message: 'Can we use single quotes for string literals in printf?',
      status: 'open',
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    }
  ],
  tasks: [
    {
      id: 'task-1',
      session_id: '00000000-0000-0000-0000-000000000001',
      title: 'Print a Pattern',
      description: 'Write a C program that prints a 5x5 asterisk right-angled triangle pattern using nested for loops.',
      initial_code: `#include <stdio.h>

int main() {
    // Write your nested loop pattern code here
    
    return 0;
}`,
      language_id: 50,
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-2',
      session_id: '00000000-0000-0000-0000-000000000001',
      title: 'Simple Calculator with Switch Case',
      description: 'Accept two integers and an operator (+, -, *, /) and output the evaluated result. Handle division by zero.',
      initial_code: `#include <stdio.h>

int main() {
    char op;
    double a, b;
    // Implement calculator logic
    return 0;
}`,
      language_id: 50,
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    }
  ],
  submissions: [
    {
      id: 'sub-1',
      task_id: 'task-1',
      student_id: 's-1',
      student_name: 'Sarah Chen',
      code: `#include <stdio.h>

int main() {
    int i, j;
    for (i = 1; i <= 5; ++i) {
        for (j = 1; j <= i; ++j) {
            printf("* ");
        }
        printf("\\n");
    }
    return 0;
}`,
      judge0_output: {
        stdout: "* \n* * \n* * * \n* * * * \n* * * * * \n",
        stderr: null,
        compile_output: null,
        time: "0.002",
        memory: 1420,
        status: { id: 3, description: "Accepted" }
      },
      status: 'reviewed',
      teacher_feedback: 'Clean indentation and correct loop boundary conditions! Excellent job.',
      score: 100,
      submitted_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    }
  ],
  activeTask: null,
  teacherExecution: null,
  teacherStdin: '',
  isTeacherRunning: false,

  setCurrentSession: (session) => set({ currentSession: session }),
  setLiveCode: (code) => set({ liveCode: code }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setOnlineCount: (count) => set({ onlineCount: count }),
  setIsTeacherLive: (isLive) => set({ isTeacherLive: isLive }),
  setDoubts: (doubts) => set({ doubts }),
  addDoubt: (doubt) => set((state) => ({ doubts: [doubt, ...state.doubts] })),
  resolveDoubt: (doubtId, reply) => set((state) => ({
    doubts: state.doubts.map((d) =>
      d.id === doubtId ? { ...d, status: 'resolved', admin_reply: reply || d.admin_reply } : d
    )
  })),
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  setActiveTask: (task) => set({ activeTask: task }),
  setSubmissions: (submissions) => set({ submissions }),
  addSubmission: (submission) => set((state) => ({ submissions: [submission, ...state.submissions] })),
  updateSubmission: (submissionId, feedback, score) => set((state) => ({
    submissions: state.submissions.map((s) =>
      s.id === submissionId ? { ...s, teacher_feedback: feedback, score, status: 'reviewed' } : s
    )
  })),
  setTeacherExecution: (output, stdin) => set({ teacherExecution: output, teacherStdin: stdin }),
  setIsTeacherRunning: (isRunning) => set({ isTeacherRunning: isRunning }),
}));
