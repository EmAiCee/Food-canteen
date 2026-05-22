import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid input', 400, validation.errors);
    }

    const { identifier, password } = validation.data;

    // Find user by staff ID or email
    const user = await User.findOne({
      $or: [{ staffId: identifier }, { email: identifier.toLowerCase() }],
      status: 'active',
    });

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      staffId: user.staffId,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      staffId: user.staffId,
      email: user.email,
      name: user.name,
      department: user.department,
      role: user.role,
    };

    return successResponse({
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}