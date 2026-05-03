export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'offer'
  | 'rejected';

export type Priority = 'low' | 'medium' | 'high';

export type WorkType = 'remote' | 'onsite' | 'hybrid';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';

export interface Contact {
    id: number;
    application_id: number;
    name: string;
    email?: string;
    linkedIn?: string;
    role?: string;
}

export interface InterviewRound {
  id: number;
  application_id: number;
  date: string;
  type: 'technical' | 'hr' | 'system_design' | 'take_home';
  interviewer_name?: string;
  notes: string;
  self_rating: 1 | 2 | 3 | 4 | 5;
}

export interface JobApplication {
  id: number;
  hash_id: string;
  user_id: number;
  company: string;
  role: string;
  job_url?: string;
  status: ApplicationStatus;
  priority: Priority;
  applied_date?: string;
  deadline?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  location?: string;
  work_type?: WorkType;
  employment_type?: EmploymentType;
  notes?: string;
  contacts: Contact[];
  interview_rounds: InterviewRound[];
  interview_rounds_count?: number; // returned by index, avoids loading full relation
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

// AI types
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface JobTags {
  role_title: string;
  company: string | null;
  location: string | null;
  seniority: string;
  employment_type: string;
  remote_policy: string;
  tech_stack: string[];
  key_requirements: string[];
  salary_range: string | null;
  company_size_hint: string;
  estimated_priority: 'high' | 'medium' | 'low';
  priority_reason: string;
}