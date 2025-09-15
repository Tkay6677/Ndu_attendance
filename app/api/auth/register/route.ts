import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, studentId, department } = await request.json();

    if (!name || !email || !password || !role || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === 'student' && !studentId) {
      return NextResponse.json(
        { error: 'Student ID is required for student accounts' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = {
      name,
      email,
      password: hashedPassword,
      role,
      studentId: role === 'student' ? studentId : undefined,
      department,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(user);

    return NextResponse.json({
      message: 'User created successfully',
      userId: result.insertedId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}