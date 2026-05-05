import { Student, Subject, GradeEntry, TeacherFeedback, Alert } from './types';

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Alwyn Santos', parentId: 'p1', classId: 'c1' },
  { id: 's2', name: 'Bea Reyes', parentId: 'p2', classId: 'c1' },
  { id: 's3', name: 'Carlo Dizon', parentId: 'p3', classId: 'c1' },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Mathematics', teacherId: 't1' },
  { id: 'sub2', name: 'Science', teacherId: 't1' },
  { id: 'sub3', name: 'English', teacherId: 't1' },
  { id: 'sub4', name: 'Filipino', teacherId: 't1' },
];

export const MOCK_GRADES: GradeEntry[] = [
  // Math
  { id: 'g1', subjectId: 'sub1', studentId: 's1', category: 'written', type: 'Quiz 1', score: 85, maxScore: 100, date: '2026-04-10' },
  { id: 'g2', subjectId: 'sub1', studentId: 's1', category: 'written', type: 'Quiz 2', score: 78, maxScore: 100, date: '2026-04-17' },
  { id: 'g3', subjectId: 'sub1', studentId: 's1', category: 'written', type: 'Problem Set', score: 90, maxScore: 100, date: '2026-04-20' },
  { id: 'g4', subjectId: 'sub1', studentId: 's1', category: 'exam', type: 'Midterm Exam', score: 72, maxScore: 100, date: '2026-04-25' },
  { id: 'g8', subjectId: 'sub1', studentId: 's1', category: 'performance', type: 'Math Journal', score: 95, maxScore: 100, date: '2026-04-28' },
  
  // Science
  { id: 'g5', subjectId: 'sub2', studentId: 's1', category: 'written', type: 'Quiz 1', score: 92, maxScore: 100, date: '2026-04-12' },
  { id: 'g6', subjectId: 'sub2', studentId: 's1', category: 'performance', type: 'Lab Report 1', score: 95, maxScore: 100, date: '2026-04-18' },
  { id: 'g7', subjectId: 'sub2', studentId: 's1', category: 'performance', type: 'Project Solar', score: 98, maxScore: 100, date: '2026-04-24' },
];

export const MOCK_FEEDBACK: TeacherFeedback[] = [
  { 
    id: 'f1', 
    studentId: 's1', 
    subjectId: 'sub1', 
    text: 'Alwyn is showing great effort in algebra. He might need a bit more practice with word problems.', 
    date: '2026-04-26',
    sentiment: 'improving'
  },
  { 
    id: 'f2', 
    studentId: 's1', 
    subjectId: 'sub2', 
    text: 'Excellent participation in lab activities. Keeps up the curiosity!', 
    date: '2026-04-26',
    sentiment: 'positive'
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    studentId: 's1',
    title: 'Math performance alert',
    message: 'Math quiz score dropped slightly this week. Consider reviewing Fractions.',
    type: 'decline',
    date: '2026-04-25',
    isRead: false
  },
  {
    id: 'a2',
    studentId: 's1',
    title: 'Science improvement',
    message: 'Significant improvement observed in Science lab reports!',
    type: 'improvement',
    date: '2026-04-24',
    isRead: true
  }
];
