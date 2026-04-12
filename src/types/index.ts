export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
// Admin interface can be extended in the future if needed
export  interface Student {
  _id: string;
  name: string;
  email: string;
  mobile_no: string;
  address: string;
  college_name: string;
  role: "student"; // strict typing
  isActive: boolean;
  solved_problem: string[]; // assuming array of problem IDs
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Problem {
  _id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  testCases: TestCase[];
  createdAt: Date;
  updatedAt: Date;
  createdBy:string;
  solved_count:number;
}

export interface Count_Prob_Stu{
  totalProblems: number;
  totalStudents: number;
  total_solved_problems: number;
}

export interface ProblemProgress {
  problemId: string;
  totalStudents: number;
  solvedCount: number;
  pendingCount: number;
}

export interface StudentProgress {
  totalProblems: number;
  solvedProblems: number;
  pendingProblems: number;
  progressOverTime: { date: string; solved: number }[];
}

export type ExecutionStatus = 'success' | 'failed' | 'error' | 'running' | 'idle';

export interface ExecutionResult {
  status: ExecutionStatus;
  output?: string;
  error?: string;
  testCasesPassed?: number;
  totalTestCases?: number;
  executionTime?: number;
}
