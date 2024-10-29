import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
const db = require('@/lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return new Promise((resolve) => {
      // Get all users except the current user
      db.all(
        `SELECT id, firstName, lastName, email, bio, studyInterests 
         FROM users 
         WHERE id != ?`,
        [decoded.userId],
        (err, users) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          resolve(NextResponse.json({ users }, { status: 200 }));
        }
      );
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
