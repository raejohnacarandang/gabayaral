/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  Users, BookOpen, Bell, TrendingUp, TrendingDown, Plus, ChevronRight, 
  MessageSquare, User, Filter, AlertCircle, CheckCircle2, Info, Loader2,
  Calendar, Award, Target, LayoutDashboard, LogOut, Settings, MoreVertical,
  Sparkles, BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { MOCK_STUDENTS, MOCK_SUBJECTS, MOCK_GRADES, MOCK_FEEDBACK, MOCK_ALERTS } from './data';
import { Role, GradeEntry, TeacherFeedback, Alert, Student, Subject } from './types';

// --- Dashboard Logic Helpers ---

const calculateAverage = (grades: GradeEntry[]) => {
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, curr) => acc + (curr.score / curr.maxScore) * 100, 0);
  return Math.round(sum / grades.length);
};

const sortByLastName = (students: Student[]) => {
  return [...students].sort((a, b) => {
    const lastNameA = a.name.split(' ').slice(-1)[0].toLowerCase();
    const lastNameB = b.name.split(' ').slice(-1)[0].toLowerCase();
    return lastNameA.localeCompare(lastNameB);
  });
};

const getStatusColor = (average: number | null) => {
  if (average === null) return 'text-slate-400 bg-slate-50 border-slate-100';
  if (average >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (average >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (average >= 80) return 'text-blue-700 bg-blue-50 border-blue-100';
  if (average >= 75) return 'text-amber-700 bg-amber-50 border-amber-100';
  return 'text-rose-700 bg-rose-50 border-rose-100';
};

const getStatusLabel = (average: number | null) => {
  if (average === null) return 'No Data Yet';
  if (average >= 90) return 'Exceeding Expectations';
  if (average >= 85) return 'Shows Progress';
  if (average >= 75) return 'Steady Performance';
  return 'Needs Improvement';
};

const SuccessModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-xl font-black text-center text-slate-900 mb-2">Success!</h3>
      <p className="text-slate-600 text-center font-medium">{message}</p>
      <button
        onClick={onClose}
        className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
      >
        Continue
      </button>
    </motion.div>
  </motion.div>
);

// --- Sub-components ---

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col items-center">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</span>
    <span className={cn("text-2xl font-bold", colorClass.split(' ')[0], "text-emerald-600")}>{value}</span>
  </div>
);

// --- Teacher Components ---

const GradeEncoder = ({ students, subjects, onAddGrade, onAddFeedback }: { students: Student[], subjects: any[], onAddGrade: any, onAddFeedback: any }) => {
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [category, setCategory] = useState<'written' | 'performance' | 'exam'>('written');
  const [customType, setCustomType] = useState('Quiz 1');
  const [feedbackText, setFeedbackText] = useState('');
  const [gradeDate, setGradeDate] = useState(new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    if (!selectedStudent && students.length > 0) {
      setSelectedStudent(students[0].id);
    }
  }, [students, selectedStudent]);

  const QUICK_TEMPLATES = [
    { text: 'Outstanding consistency!', sentiment: 'positive' as const },
    { text: 'Shows great improvement.', sentiment: 'improving' as const },
    { text: 'Needs extra practice.', sentiment: 'at-risk' as const },
    { text: 'Active class participant.', sentiment: 'positive' as const }
  ];

  const CATEGORY_MAP = {
    written: { label: 'Written Works', types: ['Quiz 1', 'Quiz 2', 'Assignment 1', 'Assignment 2', 'Short Quiz'] },
    performance: { label: 'Performance Tasks', types: ['Lab Report', 'Project', 'Activity', 'Participation', 'Journal'] },
    exam: { label: 'Exams', types: ['Midterm Exam', 'Final Exam', 'Periodical Test'] }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Plus className="w-4 h-4" />
          </div>
          Add Record
        </h3>
        
        {students.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center border-2 border-dashed border-slate-200">
            <p className="text-xs font-medium text-slate-400">
              Add a student first to encode grades.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Student</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  {sortByLastName(students).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Subject</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {[...subjects].sort((a, b) => a.name.localeCompare(b.name)).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Score</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Max Score</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-2">Category</label>
              <div className="flex gap-2">
                {(['written', 'performance', 'exam'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setCategory(c);
                      setCustomType(CATEGORY_MAP[c].types[0]);
                    }}
                    className={cn(
                      "flex-1 py-2 px-2 text-[10px] font-semibold rounded-lg transition-all text-center",
                      category === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {c === 'written' ? 'Written' : c === 'performance' ? 'Performance' : 'Exam'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Type</label>
              <div className="flex gap-2">
                <select 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                >
                  {CATEGORY_MAP[category].types.map(t => <option key={t} value={t}>{t}</option>)}
                  <option value="custom">Custom...</option>
                </select>
                {(customType === 'custom' || !CATEGORY_MAP[category].types.includes(customType)) && (
                  <input 
                    type="text"
                    placeholder="Custom..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={customType === 'custom' ? '' : customType}
                    onChange={(e) => setCustomType(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Date</label>
              <input 
                type="date" 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                value={gradeDate}
                onChange={(e) => setGradeDate(e.target.value)}
              />
            </div>

            <button 
              onClick={() => {
                if (!score || !selectedStudent) return;
                onAddGrade({
                  id: Math.random().toString(36).substr(2, 9),
                  studentId: selectedStudent,
                  subjectId: selectedSubject,
                  score: Number(score),
                  maxScore: Number(maxScore),
                  category,
                  type: customType === 'custom' ? 'Task' : customType,
                  date: gradeDate
                });
                setScore('');
                setGradeDate(new Date().toISOString().split('T')[0]);
              }}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-all text-sm"
            >
              Add Grade
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <MessageSquare className="w-4 h-4" />
          </div>
          Send Feedback
        </h3>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-[10px] font-semibold text-slate-500">Quick Notes</label>
          <button 
            onClick={() => {
              const student = students.find(s => s.id === selectedStudent);
              const msg = student 
                ? `Based on recent indicators, ${student.name.split(' ')[0]} is showing strong ${category} competencies but could benefit from more consistent review sessions.`
                : "Select a student first.";
              setFeedbackText(msg);
            }}
            className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-semibold hover:bg-emerald-200 transition-colors"
          >
            <Sparkles className="w-3 h-3" /> AI Assist
          </button>
        </div>
        <textarea 
          className="w-full h-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3"
          placeholder="Write a note for parents..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2 mb-3">
          {QUICK_TEMPLATES.map(tmp => (
            <button 
              key={tmp.text}
              onClick={() => setFeedbackText(tmp.text)}
              className="text-left px-3 py-1.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
            >
              {tmp.text}
            </button>
          ))}
        </div>
        <button 
          onClick={() => {
            if (!feedbackText || !selectedStudent) return;
            onAddFeedback({
              id: Date.now().toString(),
              studentId: selectedStudent,
              subjectId: selectedSubject,
              text: feedbackText,
              date: new Date().toISOString().split('T')[0],
              sentiment: QUICK_TEMPLATES.find(t => t.text === feedbackText)?.sentiment || 'neutral'
            });
            setFeedbackText('');
          }}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm"
        >
          Send Feedback
        </button>
      </div>
    </div>
  );
};

// --- LocalStorage Helpers ---

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
};

// --- Main Application ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => loadFromStorage('gabay_isAuth', false));
  const [role, setRole] = useState<Role>(() => loadFromStorage('gabay_role', 'parent'));
  const [activeTeacherTab, setActiveTeacherTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage('gabay_students', MOCK_STUDENTS));
  const [subjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [grades, setGrades] = useState<GradeEntry[]>(() => loadFromStorage('gabay_grades', MOCK_GRADES));
  const [feedback, setFeedback] = useState<TeacherFeedback[]>(() => loadFromStorage('gabay_feedback', MOCK_FEEDBACK));
  const [alerts, setAlerts] = useState<Alert[]>(() => loadFromStorage('gabay_alerts', MOCK_ALERTS));
  const [acknowledgedFeedbackIds, setAcknowledgedFeedbackIds] = useState<Set<string>>(() => loadFromStorage('gabay_acknowledged', new Set<string>()));
  const [isExpandingStudents, setIsExpandingStudents] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const currentUserStudent = sortByLastName(students)[0] || { id: 'none', name: 'No Student Added', parentId: 'none', classId: 'none' };
  
  const studentGrades = useMemo(() => 
    grades.filter(g => g.studentId === currentUserStudent.id), 
  [grades, currentUserStudent.id]);

  const studentAverages = useMemo(() => {
    return subjects.map(sub => {
      const subGrades = studentGrades.filter(g => g.subjectId === sub.id);
      return {
        id: sub.id,
        name: sub.name,
        average: calculateAverage(subGrades),
        recentTrend: subGrades.length > 2 
          ? (subGrades[subGrades.length-1].score / subGrades[subGrades.length-1].maxScore) >= (subGrades[subGrades.length-2].score / subGrades[subGrades.length-2].maxScore)
          : null
      };
    });
  }, [studentGrades, subjects]);

  const stats = useMemo(() => {
    const totalAvg = studentAverages.length > 0 ? Math.round(studentAverages.reduce((a, b) => a + b.average, 0) / studentAverages.length) : 0;
    const growth = 0; // Reset for demo
    return { totalAvg, growth };
  }, [studentAverages]);

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: `s-${Date.now()}`,
      name: newStudentName,
      parentId: `p-${Date.now()}`,
      classId: 'c1'
    };
    setStudents(prev => {
      const updated = [...prev, newStudent];
      saveToStorage('gabay_students', updated);
      return updated;
    });
    setNewStudentName('');
    setSuccessModal({ show: true, message: `${newStudent.name} has been added to the class registry.` });
  };

  const handleAddGrade = (newGrade: GradeEntry) => {
    setGrades(prev => {
      const updated = [...prev, newGrade];
      saveToStorage('gabay_grades', updated);
      return updated;
    });
    setSuccessModal({ show: true, message: `Grade record has been posted successfully.` });
    
    // Intelligent Risk Detection (Light AI Logic)
    const subGrades = grades.filter(g => g.studentId === newGrade.studentId && g.subjectId === newGrade.subjectId);
    if (subGrades.length > 0) {
      const prevAvg = calculateAverage(subGrades);
      const newScorePercent = (newGrade.score / newGrade.maxScore) * 100;
      
      if (newScorePercent < prevAvg - 10) {
        setAlerts(prev => [{
          id: Date.now().toString(),
          studentId: newGrade.studentId,
          title: 'Curriculum Support Opportunity',
          message: `Noticeable variance in ${subjects.find(s => s.id === newGrade.subjectId)?.name}. A supportive review session at home might be beneficial this weekend.`,
          type: 'decline',
          date: new Date().toISOString().split('T')[0],
          isRead: false
        }, ...prev]);
      } else if (newScorePercent > prevAvg + 5) {
        setAlerts(prev => [{
          id: Date.now().toString(),
          studentId: newGrade.studentId,
          title: 'Celebration Moment',
          message: `Exceptional progress recorded in ${subjects.find(s => s.id === newGrade.subjectId)?.name}! High engagement detected in ${newGrade.type}.`,
          type: 'improvement',
          date: new Date().toISOString().split('T')[0],
          isRead: false
        }, ...prev]);
      }
    }
  };

  const handleAddFeedback = (newFb: TeacherFeedback) => {
    setFeedback(prev => {
      const updated = [newFb, ...prev];
      saveToStorage('gabay_feedback', updated);
      return updated;
    });
    setSuccessModal({ show: true, message: 'Feedback has been sent to the parent successfully.' });
  };

  const handleMarkAlertRead = (alertId: string) => {
    setAlerts(prev => {
      const updated = prev.map(a => a.id === alertId ? { ...a, isRead: true } : a);
      saveToStorage('gabay_alerts', updated);
      return updated;
    });
    setSuccessModal({ show: true, message: 'Insight has been dismissed.' });
  };

  const handleAcknowledgeFeedback = (id: string) => {
    setAcknowledgedFeedbackIds(prev => {
      const updated = new Set([...prev, id]);
      saveToStorage('gabay_acknowledged', Array.from(updated));
      return updated;
    });
    setSuccessModal({ show: true, message: 'Feedback acknowledged successfully.' });
  };

  const [detailedSubjectId, setDetailedSubjectId] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-100">
              <BookOpen className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">GabayAral</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Academic Monitoring Portal</p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Select your role to continue</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setRole('teacher'); saveToStorage('gabay_role', 'teacher'); }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all",
                    role === 'teacher' ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-400 grayscale hover:grayscale-0"
                  )}
                >
                  <Award className="w-8 h-8" />
                  <span className="text-xs font-black uppercase tracking-tighter">Teacher</span>
                </button>
                <button 
                  onClick={() => { setRole('parent'); saveToStorage('gabay_role', 'parent'); }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all",
                    role === 'parent' ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-400 grayscale hover:grayscale-0"
                  )}
                >
                  <User className="w-8 h-8" />
                  <span className="text-xs font-black uppercase tracking-tighter">Parent</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder={role === 'teacher' ? "Teacher ID (e.g., T-2026)" : "Parent Access Code"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Settings className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <button 
              onClick={() => { setIsAuthenticated(true); saveToStorage('gabay_isAuth', true); saveToStorage('gabay_role', role); setSuccessModal({ show: true, message: `Welcome to GabayAral! You've logged in as ${role}.` }); }}
              className="w-full py-5 bg-slate-900 border-b-4 border-slate-950 hover:bg-black text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 transition-all active:translate-y-1 active:border-b-0 text-xs"
            >
              Initialize {role === 'teacher' ? 'Faculty Portal' : 'Parental Dashboard'}
            </button>
            
            <div className="pt-4 flex flex-col items-center gap-2">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Powered by Gemini AI Insights</p>
               <div className="flex gap-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                 <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse delay-75" />
                 <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse delay-150" />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 transition-transform hover:scale-105">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">GabayAral</span>
              <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold leading-none mt-1">Insightful Learning</p>
            </div>
          </div>


          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <Bell className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
              {alerts.some(a => !a.isRead) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none text-slate-900">{role === 'teacher' ? 'Prof. Cruz' : 'Elena Santos'}</p>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-1">{role} account</p>
              </div>
              <button 
                onClick={() => { setIsAuthenticated(false); saveToStorage('gabay_isAuth', false); }}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden transition-transform hover:rotate-3"
              >
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role === 'teacher' ? 'teacher-8' : 'parent-2'}`} alt="Avatar" />
              </button>
            </div>
          </div>
        </div>
      </nav>


      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {role === 'parent' ? (
            <motion.div 
              key="parent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Student Header & Overview */}
              <div className="lg:col-span-2 space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">Learner Insight</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 hover:text-emerald-700 transition-colors cursor-default">{currentUserStudent.name}</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                       Grade 8 • St. Jude Section <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span> 2nd Academic Period
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white p-4 px-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center min-w-[120px]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Index</span>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-2xl font-black">+{stats.growth}%</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 px-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center min-w-[120px]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engage Period</span>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-2xl font-black">W3</span>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Gabay AI Summary Card - Refined */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border border-slate-800"
                >
                   <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 group-hover:scale-125 transition-all duration-1000">
                    <Sparkles className="w-48 h-48 text-emerald-400" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-emerald-500/20 backdrop-blur-xl p-2.5 rounded-xl border border-emerald-500/30">
                        <BrainCircuit className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">Contextual Learning Analysis</span>
                    </div>
                    <h2 className="text-3xl font-black mb-4">Good morning, Elena.</h2>
                    {currentUserStudent.id === 'none' ? (
                      <p className="text-lg leading-relaxed text-slate-400 mb-8 max-w-3xl font-medium">
                        Welcome to GabayAral. Please add a student in the teacher registry and log some performance data to generate an AI insight summary.
                      </p>
                    ) : (
                      <p className="text-lg leading-relaxed text-slate-400 mb-8 max-w-3xl font-medium">
                        Based on this week's progress, <span className="text-white font-bold">{currentUserStudent.name.split(' ')[0]}</span> is currently demonstrating <span className="text-emerald-400 font-bold">strong conceptual focus</span> in Performance Tasks. We've detected a high degree of creativity in Science project logs. <span className="text-white italic">School-Home Partnership Tip:</span> Ask about the "Solar Project" today to reinforce their classroom engagement.
                      </p>
                    )}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Retention', value: currentUserStudent.id === 'none' ? '0%' : '94%', color: 'text-emerald-400' },
                        { label: 'Participation', value: currentUserStudent.id === 'none' ? 'None' : 'High', color: 'text-blue-400' },
                        { label: 'Focus Score', value: currentUserStudent.id === 'none' ? '0/10' : '8.8/10', color: 'text-indigo-400' },
                        { label: 'Next Milestone', value: 'Exam Week', color: 'text-slate-100' }
                      ].map((item, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-colors">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                          <p className={cn("text-xl font-black", item.color)}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3 mb-8 text-slate-900 tracking-tight">
                    <LayoutDashboard className="w-6 h-6 text-emerald-600" />
                    Growth Indicators
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {studentAverages.map(sub => (
                      <div 
                        key={sub.id} 
                        onClick={() => setDetailedSubjectId(detailedSubjectId === sub.id ? null : sub.id)}
                        className={cn(
                          "bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col hover:border-emerald-200 hover:shadow-md transition-all group cursor-pointer",
                          detailedSubjectId === sub.id && "ring-2 ring-emerald-500 border-transparent"
                        )}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800">{sub.name}</h3>
                            <p className="text-xs text-slate-500 font-semibold tracking-tight mt-1">Teacher: {subjects.find(s => s.id === sub.id)?.teacherId === 't1' ? 'Prof. Cruz' : 'Mr. Reyes'}</p>
                          </div>
                          <span className={cn("px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm border", getStatusColor(sub.average))}>
                            {getStatusLabel(sub.average)}
                          </span>
                        </div>
                        
                        <div className="space-y-5 flex-1">
                          {(['written', 'performance', 'exam'] as const).map(cat => {
                            const catGrades = studentGrades.filter(g => g.subjectId === sub.id && g.category === cat);
                            const avgValue = calculateAverage(catGrades);
                            const lastEntry = catGrades[catGrades.length - 1];
                            
                            return (
                              <div key={cat} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <span>{cat === 'written' ? 'WRITTEN WORKS' : cat === 'performance' ? 'PERFORMANCE TASKS' : 'PERIODICAL EXAMS'}</span>
                                  <div className="flex items-center gap-2">
                                    {lastEntry && (
                                      <span className="text-slate-400 font-medium">Latest: {lastEntry.score}/{lastEntry.maxScore}</span>
                                    )}
                                    <span className="text-slate-900">{avgValue}%</span>
                                  </div>
                                </div>
                                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${avgValue}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn(
                                      "h-full rounded-full transition-all", 
                                      cat === 'written' ? 'bg-emerald-500' : cat === 'performance' ? 'bg-blue-500' : 'bg-emerald-600'
                                    )} 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">Recent Performance Records</p>
                          <div className="space-y-2">
                            {studentGrades
                              .filter(g => g.subjectId === sub.id)
                              .slice(-5)
                              .reverse() // Show newest first
                              .map((g) => {
                                // Calculate the count for this specific type within the category
                                const subjectGradesOfCat = studentGrades.filter(sg => sg.subjectId === sub.id && sg.category === g.category);
                                const itemIndex = subjectGradesOfCat.findIndex(sg => sg.id === g.id) + 1;
                                
                                return (
                                  <div key={g.id} className="flex justify-between items-center group/item hover:bg-slate-50 p-2 rounded-xl transition-colors">
                                    <div className="flex flex-col">
                                      <span className="text-[11px] font-black text-slate-700">
                                        {g.type}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                        {g.category.replace('-', ' ')} • {new Date(g.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                    <span className={cn(
                                      "font-black text-sm px-2 py-1 rounded-lg shadow-sm border",
                                      (g.score/g.maxScore) >= 0.85 ? "text-emerald-700 bg-emerald-50 border-emerald-100" : (g.score/g.maxScore) >= 0.75 ? "text-blue-700 bg-blue-50 border-blue-100" : "text-amber-700 bg-amber-50 border-amber-100"
                                    )}>
                                      {g.score}<span className="opacity-30 mx-0.5">/</span>{g.maxScore}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grade History (Brief) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                    <span>Performance History</span>
                    <select className="text-sm bg-slate-50 border-none rounded-lg py-1 px-3">
                      <option>Last 30 Days</option>
                      <option>Last 3 Months</option>
                    </select>
                  </h2>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={studentGrades.slice(-10).map((g, index) => ({ 
                        name: `R${index+1}`, 
                        val: (g.score/g.maxScore)*100,
                        subject: subjects.find(s => s.id === g.subjectId)?.name
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" hide />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          formatter={(value: number) => [`${Math.round(value)}%`, 'Score']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="val" 
                          stroke="#10b981" 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-slate-400 text-xs mt-4 italic">Dots represent quiz/activity results over time. Consistency is key!</p>
                </div>
              </div>

              {/* Right Column: Alerts & Feedback */}
              <div className="space-y-8">
                {/* Insights Panel */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                       <Bell className="w-5 h-5 text-amber-500" />
                       Recent Insights
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {alerts.filter(a => !a.isRead).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-8 font-medium">All caught up! No new notifications.</p>
                    )}
                    {alerts.filter(a => !a.isRead).map(alert => (
                      <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={alert.id} 
                        onClick={() => handleMarkAlertRead(alert.id)}
                        className={cn(
                          "p-5 rounded-2xl border flex gap-4 transition-all relative overflow-hidden cursor-pointer group hover:shadow-md",
                          alert.type === 'decline' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                          alert.type === 'decline' ? "bg-white text-amber-600" : "bg-white text-emerald-600"
                        )}>
                          {alert.type === 'decline' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{alert.title}</p>
                          <p className="text-xs text-slate-700 leading-relaxed font-semibold">{alert.message}</p>
                          <div className="flex justify-between items-end mt-3">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(alert.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[9px] font-black text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">DISMISS</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Teacher Feedback Panel */}
                <section>
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Educator's Feedback
                  </h3>
                  <div className="space-y-6">
                    {feedback.map(fb => (
                      <div key={fb.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
                        <div className="absolute -left-1 top-6 w-1 h-12 rounded-full bg-emerald-200 group-hover:bg-emerald-500 transition-colors" />
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.15em]">
                            {subjects.find(s => s.id === fb.subjectId)?.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{fb.date}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed italic font-medium">"{fb.text}"</p>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className={cn("w-2 h-2 rounded-full", fb.sentiment === 'positive' ? "bg-emerald-500" : "bg-emerald-400")} />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fb.sentiment === 'positive' ? 'Progressive Win' : 'Developmental Focus'}</span>
                           </div>
                           <button 
                             onClick={() => handleAcknowledgeFeedback(fb.id)}
                             disabled={acknowledgedFeedbackIds.has(fb.id)}
                             className={cn(
                               "text-[10px] font-black uppercase transition-all",
                               acknowledgedFeedbackIds.has(fb.id) ? "text-slate-300 cursor-default" : "text-emerald-600 hover:text-emerald-800"
                             )}
                           >
                             {acknowledgedFeedbackIds.has(fb.id) ? 'Seen by Parent' : 'Acknowledge'}
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Gabay Protocol Card */}
                <div className="bg-slate-900 px-10 py-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
                   <div className="flex items-center gap-3 mb-6 relative z-10">
                     <BrainCircuit className="w-5 h-5 text-emerald-400" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Gabay Protocol v2.4</span>
                   </div>
                   <h4 className="text-3xl font-black mb-4 relative z-10 tracking-tight">The Future of <br/>Collaborative Mentoring.</h4>
                   <p className="text-sm text-slate-400 leading-relaxed mb-8 relative z-10 font-medium max-w-md">
                     We believe academic monitoring should feel like a bridge, not a report card. GabayAral translates scores into progress stories that empower parents and support teachers.
                   </p>
                   <div className="flex items-center gap-4 relative z-10">
                     <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                       <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> ADVOCATING PROGRESS
                     </div>
                     <span className="w-1 h-3 bg-slate-800 rounded-full"></span>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">REAL-TIME SYNC</span>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="teacher"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Sidebar for Teachers */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">Faculty Hub</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">S.Y. 2025-2026</p>
                    </div>
                  </div>
                  <nav className="space-y-1">
                    {[
                      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                      { id: 'classes', icon: Users, label: 'My Classes' },
                      { id: 'curriculum', icon: BookOpen, label: 'Curriculum' },
                      { id: 'feedback', icon: MessageSquare, label: 'Feedback' }
                    ].map(item => (
                      <button 
                        key={item.id}
                        onClick={() => setActiveTeacherTab(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all text-sm",
                          activeTeacherTab === item.id 
                            ? "bg-slate-900 text-white" 
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <item.icon className="w-4 h-4" /> {item.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Stats</p>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-2xl font-black">{students.length}</p>
                      <p className="text-[9px] text-slate-400 uppercase">Students</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-2xl font-black">{grades.length}</p>
                      <p className="text-[9px] text-slate-400 uppercase">Records</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Actions</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setNewStudentName('')}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Student
                    </button>
                  </div>
                </div>
              </div>

              {/* Central Area: Content based on active tab */}
              <div className="lg:col-span-3 space-y-6">
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      {activeTeacherTab === 'dashboard' ? 'Performance Dashboard' : 
                       activeTeacherTab === 'classes' ? 'My Classes / Grade 8 • St. Jude' :
                       activeTeacherTab === 'curriculum' ? 'Academic Curriculum' : 
                       'Parent Communication Hub'}
                    </h1>
                    <p className="text-sm text-slate-500">
                      {activeTeacherTab === 'dashboard' ? 'Real-time Class Performance Monitoring' : 
                       activeTeacherTab === 'classes' ? 'Standard Student List & Registry' :
                       activeTeacherTab === 'curriculum' ? 'Subject & Material Management' : 
                       'Managing School-Home Partnership'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Period:</span>
                    <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Period 1</option>
                      <option>Period 2</option>
                      <option>Period 3</option>
                    </select>
                  </div>
                </header>

                <div className="flex flex-col lg:flex-row w-full gap-8">
                  {/* Left Column: Core Tab Content */}
                  <div className="flex-1 min-w-0 overflow-hidden space-y-8">
                    {activeTeacherTab === 'dashboard' && (
                      <div className="space-y-8">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Students</p>
                              <Users className="w-5 h-5 text-slate-600" />
                            </div>
                            <h3 className="text-3xl font-black">{students.length}</h3>
                            <p className="text-xs text-emerald-400 mt-2 font-medium">
                              {students.length > 0 ? 'Active Enrollment' : 'No Students Yet'}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Class Average</p>
                              <Target className="w-5 h-5 text-emerald-300" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Class Average</p>
                            <h3 className="text-3xl font-black">{students.length > 0 ? '88%' : '0%'}</h3>
                            <p className="text-xs text-emerald-200 mt-2 font-medium">
                              {students.length > 0 ? 'Performance Score' : 'Add grades to see'}
                            </p>
                          </div>
                        </div>

                        {/* Student Performance Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-800">Class Performance</h3>
                            <span className="text-[10px] font-medium text-slate-400">{students.length} students</span>
                          </div>
                          
                          {students.length === 0 ? (
                            <div className="p-12 text-center">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-slate-300" />
                              </div>
                              <h4 className="text-lg font-bold text-slate-400">Class Registry is Empty</h4>
                              <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2 font-medium">Use the Student Registry panel on the right to add your first student and start recording progress.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Average</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Entry</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {sortByLastName(students).slice(0, isExpandingStudents ? undefined : 5).map(student => {
                                    const sGrades = grades.filter(g => g.studentId === student.id);
                                    const avg = calculateAverage(sGrades);
                                    return (
                                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                                              {student.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{student.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4">
                                          <span className="font-bold text-slate-700">{avg}%</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-500 text-sm">
                                          {sGrades[sGrades.length-1]?.score || 0}/{sGrades[sGrades.length-1]?.maxScore || 100}
                                        </td>
                                        <td className="px-6 py-4">
                                          <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border", getStatusColor(avg))}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", avg >= 75 ? "bg-emerald-500" : "bg-rose-500")} />
                                            {getStatusLabel(avg)}
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                          
                          {students.length > 5 && (
                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                              <button 
                                onClick={() => setIsExpandingStudents(!isExpandingStudents)}
                                className="text-xs font-bold text-indigo-600 hover:underline"
                              >
                                {isExpandingStudents ? 'Collapse List' : 'View All Students'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTeacherTab === 'classes' && (
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
                         <Users className="w-16 h-16 text-slate-200 mb-4" />
                         <h3 className="text-xl font-bold text-slate-800">My Classes Registry</h3>
                         <p className="text-slate-500 text-sm mt-2 max-w-sm">Detailed class list and seat plan management. You currently have {students.length} students enrolled in Grade 8 • St. Jude.</p>
                      </div>
                    )}

                    {activeTeacherTab === 'curriculum' && (
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
                         <BookOpen className="w-16 h-16 text-slate-200 mb-4" />
                         <h3 className="text-xl font-bold text-slate-800">Curriculum & Resources</h3>
                         <p className="text-slate-500 text-sm mt-2 max-w-sm">Manage lesson plans, worksheets, and competency standards for the current academic period.</p>
                      </div>
                    )}

                    {activeTeacherTab === 'feedback' && (
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
                         <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
                         <h3 className="text-xl font-bold text-slate-800">Communication Logs</h3>
                         <p className="text-slate-500 text-sm mt-2 max-w-sm">History of sent feedback and parent interactions. Use the sidebar panels to send new communications.</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Interactive Panels */}
                  <div className="w-full lg:w-[340px] flex-shrink-0 space-y-4">
                    {/* Student Registry */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-600" />
                          Student Registry
                        </h3>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{students.length}</span>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Add student name..."
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                        />
                        <button 
                          onClick={handleAddStudent}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <GradeEncoder 
                      students={students} 
                      subjects={subjects} 
                      onAddGrade={handleAddGrade}
                      onAddFeedback={handleAddFeedback}
                    />

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <div className="flex items-start gap-3">
                         <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                           <Info className="w-4 h-4 text-blue-600" />
                         </div>
                         <div className="text-[11px] leading-relaxed text-slate-600">
                           <strong className="text-slate-900">Tip:</strong> Regular feedback strengthens school-home partnership.
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {successModal.show && (
          <SuccessModal 
            message={successModal.message} 
            onClose={() => setSuccessModal({ show: false, message: '' })} 
          />
        )}
      </AnimatePresence>

      {/* Floating Footer Log */}
      <footer className="mt-auto bg-slate-900 text-white px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <p className="text-xs font-bold text-slate-400 tracking-tight uppercase">System Online: <span className="text-slate-100">Synchronized and Secure</span></p>
        </div>
        <div className="flex gap-6">
          <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Privacy Policy</button>
          <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Support Portal</button>
          <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Contact IT</button>
        </div>
      </footer>
    </div>
  );
}

