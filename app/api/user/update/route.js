import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
const db = require('@/utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(request) {
  try {
    // Verify JWT token
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

    const { firstName, lastName, bio, studyInterests } = await request.json();

    return new Promise((resolve, reject) => {
      // First verify the user exists
      db.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, user) => {
        if (err) {
          console.error('Database error checking user:', err);
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        if (!user) {
          resolve(NextResponse.json({ error: 'User not found' }, { status: 404 }));
          return;
        }

        // Now perform the update with proper error handling
        const updateQuery = `
          UPDATE users 
          SET firstName = COALESCE(?, firstName),
              lastName = COALESCE(?, lastName),
              bio = COALESCE(?, bio),
              studyInterests = COALESCE(?, studyInterests)
          WHERE id = ?
        `;

        const params = [
          firstName || null,
          lastName || null,
          bio || null,
          studyInterests || null,
          decoded.userId
        ];

        db.run(updateQuery, params, function(err) {
          if (err) {
            console.error('Database error updating user:', err);
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          // Fetch the updated user data
          db.get(
            'SELECT id, firstName, lastName, email, bio, studyInterests FROM users WHERE id = ?',
            [decoded.userId],
            (err, updatedUser) => {
              if (err) {
                console.error('Database error fetching updated user:', err);
                resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                return;
              }

              resolve(
                NextResponse.json(
                  {
                    message: 'Profile updated successfully',
                    user: updatedUser
                  },
                  { status: 200 }
                )
              );
            }
          );
        });
      });
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
