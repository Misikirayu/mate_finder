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

    const { senderId } = await request.json();

    return new Promise((resolve) => {
      db.run(
        'UPDATE messages SET seen = 1 WHERE sender_id = ? AND receiver_id = ? AND seen = 0',
        [senderId, decoded.userId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          db.all(
            `SELECT sender_id, COUNT(*) as unread_count 
             FROM messages 
             WHERE receiver_id = ? AND seen = 0 
             GROUP BY sender_id`,
            [decoded.userId],
            (err, counts) => {
              if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                return;
              }

              const unreadCounts = {};
              counts.forEach(count => {
                unreadCounts[count.sender_id] = count.unread_count;
              });

              resolve(
                NextResponse.json(
                  { 
                    message: 'Messages marked as seen',
                    unreadCounts: unreadCounts
                  },
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