export interface Account {
  id?: number;
  username: string;
  email: string;
  password?: string; // Add optional password field
  role: string;
  status: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}