export type Role = 'teacher' | 'parent';

export interface GradeEntry {
  id: string;
  subjectId: string;
  studentId: string;
  category: 'written' | 'performance' | 'exam';
  type: string; // e.g. 'Quiz 1', 'Lab Report', 'Midterm'
  score: number;
  maxScore: number;
  date: string;
  comment?: string;
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string;
}

export interface Student {
  id: string;
  name: string;
  parentId: string;
  classId: string;
}

export interface TeacherFeedback {
  id: string;
  studentId: string;
  subjectId: string;
  text: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'improving' | 'at-risk';
}

export interface Alert {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: 'improvement' | 'decline' | 'missing' | 'general';
  date: string;
  isRead: boolean;
}
