import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
const db = require('@/utils/db');

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    try {
      await writeFile(uploadDir, ''); // This will fail if directory doesn't exist
    } catch {
      // Directory doesn't exist, create it
      const fs = require('fs');
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `user-${decoded.userId}-${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save file
    await writeFile(filePath, buffer);
    const imageUrl = `/uploads/${fileName}`;

    return new Promise((resolve) => {
      db.run(
        'UPDATE users SET profileImage = ? WHERE id = ?',
        [imageUrl, decoded.userId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          db.get(
            'SELECT id, firstName, lastName, email, bio, studyInterests, profileImage FROM users WHERE id = ?',
            [decoded.userId],
            (err, user) => {
              if (err) {
                resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                return;
              }

              resolve(
                NextResponse.json(
                  {
                    message: 'Profile image updated successfully',
                    user: user
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
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
