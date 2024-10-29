const { NextResponse } = require('next/server');
const bcrypt = require('bcryptjs');
const db = require('@/lib/db');

async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    return new Promise(async (resolve) => {
      // Check if email already exists
      db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json(
            { error: 'Database error' },
            { status: 500 }
          ));
          return;
        }

        if (user) {
          resolve(NextResponse.json(
            { error: 'Email already registered' },
            { status: 400 }
          ));
          return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.run(
          'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
          [firstName, lastName, email, hashedPassword],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              resolve(NextResponse.json(
                { error: 'Database error' },
                { status: 500 }
              ));
              return;
            }

            // Get the created user (without password)
            db.get(
              'SELECT id, firstName, lastName, email, bio, studyInterests FROM users WHERE id = ?',
              [this.lastID],
              (err, newUser) => {
                if (err) {
                  resolve(NextResponse.json(
                    { error: 'Database error' },
                    { status: 500 }
                  ));
                  return;
                }

                resolve(NextResponse.json(
                  {
                    message: 'User registered successfully',
                    user: newUser
                  },
                  { status: 201 }
                ));
              }
            );
          }
        );
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

module.exports = { POST }; 