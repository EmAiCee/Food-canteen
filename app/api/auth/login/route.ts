import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth';
import { createSession } from '@/lib/auth-cookies';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  identifier: z.string().min(1, 'Staff ID or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(ip, 5, 60 * 1000); // 5 attempts per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    await connectDB();

    const body = await req.json();
    
    // Validate input with Zod
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }

    const { identifier, password } = validation.data;

    // Find user
    const user = await User.findOne({
      $or: [{ staffId: identifier }, { email: identifier.toLowerCase() }],
      status: 'active',
    }).select('+password');

    if (!user) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Timing attack prevention
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create session cookie
    await createSession({
      userId: user._id.toString(),
      staffId: user.staffId,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Return user data (no token in response - it's in cookie)
    const userData = {
      id: user._id,
      staffId: user.staffId,
      email: user.email,
      name: user.name,
      department: user.department,
      role: user.role,
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}