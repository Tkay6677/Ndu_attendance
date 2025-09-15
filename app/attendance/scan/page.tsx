'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function ScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    session?: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }

    if (status === 'authenticated' && token && session?.user?.role === 'student') {
      recordAttendance();
    } else if (status === 'authenticated' && session?.user?.role !== 'student') {
      setResult({
        success: false,
        message: 'Only students can mark attendance',
      });
      setLoading(false);
    } else if (!token) {
      setResult({
        success: false,
        message: 'Invalid QR code',
      });
      setLoading(false);
    }
  }, [status, token, session]);

  const recordAttendance = async () => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      setResult({
        success: response.ok,
        message: data.message || data.error,
        session: data.session,
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing attendance...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {result?.success ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" />
                Attendance Recorded
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-red-600" />
                Attendance Failed
              </>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className={`text-sm ${result?.success ? 'text-green-700' : 'text-red-700'}`}>
            {result?.message}
          </p>

          {result?.success && result.session && (
            <div className="bg-green-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold text-green-800 mb-2">Session Details</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Course:</strong> {result.session.course}</p>
                <p><strong>Title:</strong> {result.session.title}</p>
                <p className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <strong>Time:</strong> {new Date(result.session.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
            
            {!result?.success && (
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-800 hover:bg-blue-900"
              >
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}