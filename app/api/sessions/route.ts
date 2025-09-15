import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { generateQRCodeForSession } from '@/lib/utils/qr';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const lecturerEmail = searchParams.get('lecturer');

    let query = {};
    if (session.user.role === 'lecturer') {
      query = { lecturerEmail: session.user.email };
    } else if (lecturerEmail) {
      query = { lecturerEmail };
    }

    const sessions = await db
      .collection('sessions')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'lecturer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, course, startTime, duration, location } = await request.json();

    if (!title || !course || !startTime || !duration || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate end time based on duration
    const startDate = new Date(startTime);
    const endTime = new Date(startDate.getTime() + parseInt(duration) * 60000); // duration in minutes to milliseconds

    const { db } = await connectToDatabase();

    const sessionDoc = {
      title,
      course,
      lecturer: session.user.name,
      duration: parseInt(duration),
      lecturerEmail: session.user.email,
      department: session.user.department,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      qrCode: '',
      isActive: true,
      createdAt: new Date(),
    };

    const result = await db.collection('sessions').insertOne(sessionDoc);
    const sessionId = result.insertedId.toString();

    const qrCode = await generateQRCodeForSession(sessionId);
    await db.collection('sessions').updateOne(
      { _id: result.insertedId },
      { $set: { qrCode } }
    );

    return NextResponse.json({
      message: 'Session created successfully',
      sessionId,
      qrCode,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}