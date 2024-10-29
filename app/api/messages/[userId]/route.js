const { NextResponse } = require('next/server');
const jwt = require('jsonwebtoken');
const db = require('@/lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

async function GET(request, { params }) {
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

    console.log('Fetching messages for:', {
      currentUser: decoded.userId,
      otherUser: params.userId
    });

    return new Promise((resolve) => {
      db.all(
        `SELECT * FROM messages 
         WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at ASC`,
        [decoded.userId, params.userId, params.userId, decoded.userId],
        (err, messages) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          console.log('Found messages:', messages);
          resolve(NextResponse.json({ messages }, { status: 200 }));
        }
      );
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

module.exports = { GET };
