import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyQRToken } from '@/lib/utils/qr';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const qrData = verifyQRToken(token);
    if (!qrData) {
      return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const sessionDoc = await db
      .collection('sessions')
      .findOne({ _id: new ObjectId(qrData.sessionId) });

    if (!sessionDoc) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!sessionDoc.isActive) {
      return NextResponse.json(
        { error: 'Session is not active. Please wait for the lecturer to activate it.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const startTime = new Date(sessionDoc.startTime);
    const endTime = new Date(sessionDoc.endTime);

    if (now < startTime) {
      return NextResponse.json(
        { error: `Session hasn't started yet. It will start at ${startTime.toLocaleTimeString()}` },
        { status: 400 }
      );
    }

    if (now > endTime) {
      return NextResponse.json(
        { error: 'Session has ended' },
        { status: 400 }
      );
    }

    const existingAttendance = await db.collection('attendance').findOne({
      sessionId: qrData.sessionId,
      studentEmail: session.user.email,
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already recorded' },
        { status: 400 }
      );
    }

    const attendanceRecord = {
      sessionId: qrData.sessionId,
      studentId: session.user.studentId,
      studentName: session.user.name,
      studentEmail: session.user.email,
      timestamp: now,
    };

    await db.collection('attendance').insertOne(attendanceRecord);

    return NextResponse.json({
      message: 'Attendance recorded successfully',
      session: {
        title: sessionDoc.title,
        course: sessionDoc.course,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    let query = {};
    if (session.user.role === 'student') {
      query = { studentEmail: session.user.email };
    } else if (sessionId) {
      query = { sessionId };
    }

    const attendance = await db
      .collection('attendance')
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}