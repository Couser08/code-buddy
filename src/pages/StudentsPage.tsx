import React from 'react';
import { Users, Shield, CheckCircle, Award, Sparkles, BookOpen } from 'lucide-react';
import { ADMIN_EMAIL } from '../lib/constants';

export const StudentsPage: React.FC = () => {
  const students = [
    {
      id: '1',
      name: 'Rahul Tungariya',
      email: ADMIN_EMAIL,
      role: 'Instructor (Admin)',
      isTeacher: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      status: 'Broadcasting Live',
      tasksCompleted: 'All Created',
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah.chen@univ.edu',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      status: 'Active in Live Session',
      tasksCompleted: '3 of 3 solved',
    },
    {
      id: '3',
      name: 'Alex Rivera',
      email: 'alex.r@devstudent.io',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      status: 'Active in Live Session',
      tasksCompleted: '2 of 3 solved',
    },
    {
      id: '4',
      name: 'Elena Rostova',
      email: 'elena.rostova@tech.edu',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      status: 'Active in Live Session',
      tasksCompleted: '2 of 3 solved',
    },
    {
      id: '5',
      name: 'Marcus Brody',
      email: 'marcus.b@engineering.ac.in',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      status: 'Offline (Last seen 2h ago)',
      tasksCompleted: '1 of 3 solved',
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Classroom Community</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Enrolled Students & Attendance
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Live attendance tracking, submission milestones, and role enforcement powered by PostgreSQL RLS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            87 Students Connected
          </span>
        </div>
      </div>

      {/* Roster Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Classroom Roster</h3>
          <span className="text-xs text-slate-400">Strict Single-Admin Access</span>
        </div>

        <div className="divide-y divide-slate-100">
          {students.map((student) => (
            <div
              key={student.id}
              className="p-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                      student.status.includes('Active') || student.status.includes('Live')
                        ? 'bg-emerald-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                    {student.isTeacher ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-purple-700" />
                        Admin Teacher
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Student
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{student.email}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 block">
                  {student.tasksCompleted}
                </span>
                <span className="text-[11px] text-slate-400">{student.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
