'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Users, BookOpen, Shield } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-4">
            Niger Delta University
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
            QR Code Attendance System
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Modern, secure, and efficient attendance tracking for lectures and classes. 
            Simplifying education management with cutting-edge technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/auth/signin')}
              size="lg"
              className="bg-blue-800 hover:bg-blue-900"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => router.push('/auth/register')}
              size="lg"
              variant="outline"
            >
              Register
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <QrCode className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>QR Code Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Dynamic QR codes for each session with built-in security and expiration
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Separate interfaces for students and lecturers with appropriate permissions
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Session Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Complete session lifecycle management with real-time attendance tracking
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced security features with MongoDB storage and NextAuth authentication
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                How It Works
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Lecturer Creates Session</h4>
                    <p className="text-gray-600">Schedule a class session with course details, time, and location</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">QR Code Generated</h4>
                    <p className="text-gray-600">Unique, time-limited QR code is automatically created for the session</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Students Scan</h4>
                    <p className="text-gray-600">Students scan the QR code during class to mark their attendance</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Attendance Recorded</h4>
                    <p className="text-gray-600">Real-time attendance tracking with comprehensive reporting</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
                <QrCode className="w-32 h-32 mx-auto text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Get Started?
                </h4>
                <p className="text-gray-600 mb-6">
                  Join hundreds of students and lecturers already using our system
                </p>
                <Button 
                  onClick={() => router.push('/auth/register')}
                  size="lg"
                  className="bg-blue-800 hover:bg-blue-900"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}