import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
const db = require('@/utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request, { params }) {
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
      db.get(
        `SELECT id, firstName, lastName, email, bio, studyInterests 
         FROM users 
         WHERE id = ?`,
        [params.id],
        (err, user) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          if (!user) {
            resolve(NextResponse.json({ error: 'User not found' }, { status: 404 }));
            return;
          }

          resolve(NextResponse.json({ user }, { status: 200 }));
        }
      );
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
