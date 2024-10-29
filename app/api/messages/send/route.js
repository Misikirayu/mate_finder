const { NextResponse } = require('next/server');
const jwt = require('jsonwebtoken');
const db = require('@/lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

async function POST(request) {
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

    const { receiverId, content } = await request.json();

    console.log('Sending message:', {
      senderId: decoded.userId,
      receiverId,
      content
    });

    return new Promise((resolve) => {
      db.run(
        'INSERT INTO messages (sender_id, receiver_id, content, seen) VALUES (?, ?, ?, 0)',
        [decoded.userId, receiverId, content],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          // Get the inserted message
          db.get(
            'SELECT * FROM messages WHERE id = ?',
            [this.lastID],
            (err, message) => {
              if (err) {
                console.error('Error fetching inserted message:', err);
                resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                return;
              }

              console.log('Message stored:', message);
              resolve(
                NextResponse.json(
                  { message: 'Message sent successfully', data: message },
                  { status: 200 }
                )
              );
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

module.exports = { POST };
