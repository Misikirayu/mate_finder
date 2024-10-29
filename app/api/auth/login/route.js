const { NextResponse } = require('next/server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('@/lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    return new Promise((resolve) => {
      // Find user by email
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        async (err, user) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json(
              { error: 'Database error' },
              { status: 500 }
            ));
            return;
          }

          if (!user) {
            resolve(NextResponse.json(
              { error: 'Invalid email or password' },
              { status: 401 }
            ));
            return;
          }

          // Compare passwords
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            resolve(NextResponse.json(
              { error: 'Invalid email or password' },
              { status: 401 }
            ));
            return;
          }

          // Generate JWT token
          const token = jwt.sign(
            { 
              userId: user.id,
              email: user.email 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          // Remove password from user object
          const { password: _, ...userWithoutPassword } = user;

          resolve(NextResponse.json(
            {
              message: 'Login successful',
              token,
              user: userWithoutPassword
            },
            { status: 200 }
          ));
        }
      );
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