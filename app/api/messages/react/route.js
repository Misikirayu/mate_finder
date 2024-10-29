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

    const { messageId, reaction } = await request.json();

    console.log('Adding reaction:', { messageId, reaction });

    return new Promise((resolve) => {
      db.run(
        'UPDATE messages SET reaction = ? WHERE id = ?',
        [reaction, messageId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          db.get(
            'SELECT * FROM messages WHERE id = ?',
            [messageId],
            (err, updatedMessage) => {
              if (err) {
                console.error('Error fetching updated message:', err);
                resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                return;
              }

              console.log('Updated message:', updatedMessage);
              resolve(
                NextResponse.json(
                  { 
                    message: 'Reaction added successfully',
                    data: updatedMessage
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