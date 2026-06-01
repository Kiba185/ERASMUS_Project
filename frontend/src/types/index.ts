export interface User {
  id: string;
  user: any;
  userName?: string;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  firstName: string;
  lastName: string;
  adress: string;
  birthday: string;
  email: string;
  phone: string;
  children?: { id: string; firstName: string; lastName: string }[];
}
