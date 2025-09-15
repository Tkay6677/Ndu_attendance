export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer';
  studentId?: string;
  department: string;
  createdAt: Date;
}

export interface Session {
  _id: string;
  title: string;
  course: string;
  lecturer: string;
  lecturerEmail: string;
  department: string;
  startTime: Date;
  endTime: Date;
  location: string;
  qrCode: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AttendanceRecord {
  _id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  timestamp: Date;
}

export interface QRCodeData {
  sessionId: string;
  timestamp: number;
  signature: string;
}