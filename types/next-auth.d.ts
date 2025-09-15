import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    role: 'student' | 'lecturer';
    studentId?: string;
    department: string;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: 'student' | 'lecturer';
      studentId?: string;
      department: string;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'student' | 'lecturer';
    studentId?: string;
    department: string;
  }
}