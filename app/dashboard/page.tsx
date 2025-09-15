'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LecturerDashboard from '@/components/dashboard/LecturerDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-blue-800 truncate max-w-[200px] sm:max-w-none">
                Niger Delta University
              </h1>
              <span className="text-sm text-gray-600">Attendance System</span>
            </div>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <div className="text-sm max-w-[150px] sm:max-w-none">
                  <div className="font-medium truncate">{session.user?.name}</div>
                  <div className="text-gray-500 capitalize">{session.user?.role}</div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {session.user?.role === 'lecturer' ? (
          <LecturerDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>
    </div>
  );
}