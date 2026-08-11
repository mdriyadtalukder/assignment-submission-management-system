export type Role = "Admin" | "Teacher" | "Student";
export interface User {
  id: string;
  email: string;
  role: Role;
  courseIds: string[];
}
export interface Course {
  id: string;
  name: string;
  description?: string | null;
}
export interface Subject {
  id: string;
  name: string;
  courseId?: string | null;
  teacherId?: string | null;
}
export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  maximumMarks: number;
  courseId: string;
  subjectId: string;
  teacherId: string;
  status: string;
}
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  marks?: number | null;
  feedback?: string | null;
  status?: string | null;
}
export interface LoginResponse {
  token: string;
  user: User;
}
