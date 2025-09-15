'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, QrCode, Eye, EyeOff, Download } from 'lucide-react';
import { format } from 'date-fns';
import CreateSessionForm from './CreateSessionForm';
import QRCodeDisplay from './QRCodeDisplay';
import { downloadAttendanceCSV } from '@/lib/utils/export';

interface AttendanceRecord {
  _id: string;
  sessionId: string;
  studentId: string;
  name: string;
  email: string;
  timestamp: string;
}

interface Session {
  _id: string;
  title: string;
  course: string;
  startTime: string;
  endTime: string;
  location: string;
  qrCode: string;
  isActive: boolean;
  createdAt: string;
  lecturer: string;
  duration: number;
}

export default function LecturerDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: AttendanceRecord[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
        
        // Fetch attendance count for each session
        for (const session of data) {
          fetchAttendanceCount(session._id);
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceCount = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/attendance?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(prev => ({ ...prev, [sessionId]: data }));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const toggleSessionActive = async (sessionId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setSessions(sessions.map(session => 
          session._id === sessionId 
            ? { ...session, isActive: !isActive }
            : session
        ));
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-800 hover:bg-blue-900 w-full sm:w-auto"
        >
          Create New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <Card key={session._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{session.title}</CardTitle>
                <Badge variant={session.isActive ? "default" : "secondary"}>
                  {session.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 font-medium">{session.course}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(session.startTime), 'MMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 break-words">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>
                  {format(new Date(session.startTime), 'HH:mm')} ({session.duration} minutes)
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 break-words">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{session.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{(attendanceData[session._id] || []).length} students attended</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSession(session)}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  QR Code
                </Button>
                
                <Button
                  size="sm"
                  variant={session.isActive ? "destructive" : "default"}
                  onClick={() => toggleSessionActive(session._id, session.isActive)}
                >
                  {session.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadAttendanceCSV(attendanceData[session._id] || [], session)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-600 mb-4">Create your first class session to get started</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-800 hover:bg-blue-900"
            >
              Create Session
            </Button>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <CreateSessionForm 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchSessions();
          }}
        />
      )}

      {selectedSession && (
        <QRCodeDisplay 
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}