'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, QrCode, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import QRScanner from './QRScanner';

interface AttendanceRecord {
  _id: string;
  sessionId: string;
  timestamp: string;
}

interface Session {
  _id: string;
  title: string;
  course: string;
  lecturer: string;
  startTime: string;
  endTime: string;
  location: string;
}

export default function StudentDashboard() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sessions, setSessions] = useState<{[key: string]: Session}>({});
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('/api/attendance');
      if (response.ok) {
        const data = await response.json();
        setAttendance(data);
        
        // Fetch session details for each attendance record
        const sessionIds = Array.from(new Set(data.map((record: AttendanceRecord) => record.sessionId)));
        for (const sessionId of sessionIds) {
          fetchSessionDetails(String(sessionId));
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(prev => ({ ...prev, [sessionId]: data }));
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  };

  const handleScanSuccess = () => {
    setShowScanner(false);
    fetchAttendance();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <Button 
          onClick={() => setShowScanner(true)}
          className="bg-blue-800 hover:bg-blue-900 w-full sm:w-auto"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Scan QR Code
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-800">{attendance.length}</div>
            <p className="text-sm text-gray-600">Classes Attended</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {attendance.filter(record => {
                const session = sessions[record.sessionId];
                return session && new Date(record.timestamp) <= new Date(session.endTime);
              }).length}
            </div>
            <p className="text-sm text-gray-600">On Time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((attendance.length / Math.max(Object.keys(sessions).length, 1)) * 100)}%
            </div>
            <p className="text-sm text-gray-600">Attendance Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No attendance records yet</p>
              <Button 
                onClick={() => setShowScanner(true)}
                className="bg-blue-800 hover:bg-blue-900"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan Your First QR Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {attendance.map((record) => {
                const session = sessions[record.sessionId];
                if (!session) return null;
                
                return (
                  <div key={record._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="space-y-1 w-full sm:w-auto">
                      <h4 className="font-semibold">{session.title}</h4>
                      <p className="text-sm text-gray-600">{session.course}</p>
                      <p className="text-sm text-gray-500">by {session.lecturer}</p>
                      
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1 min-w-fit">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{format(new Date(session.startTime), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 min-w-fit">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{format(new Date(session.startTime), 'HH:mm')}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="break-words">{session.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 w-full sm:w-auto">
                      <Badge variant="default" className="sm:mb-2">
                        Present
                      </Badge>
                      <p className="text-xs text-gray-500">
                        Marked at {format(new Date(record.timestamp), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showScanner && (
        <QRScanner 
          onClose={() => setShowScanner(false)}
          onSuccess={handleScanSuccess}
        />
      )}
    </div>
  );
}