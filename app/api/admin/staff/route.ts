import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { getSessionFromRequest } from '@/lib/auth-cookies';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const createStaffSchema = z.object({
  staffId: z.string().regex(/^[A-Z0-9]+$/i, 'Staff ID must contain only letters and numbers'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().optional(),
  role: z.enum(['staff', 'admin']).default('staff'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const staff = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      staff: staff
    });
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validation = createStaffSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { staffId, email, name, department, role } = validation.data;
    
    await connectDB();
    
    // Check for duplicates
    const existingStaff = await User.findOne({
      $or: [{ staffId }, { email: email.toLowerCase() }]
    });
    
    if (existingStaff) {
      return NextResponse.json(
        { error: 'Staff ID or email already exists' },
        { status: 400 }
      );
    }
    
    // Create staff with temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);
    
    const newStaff = await User.create({
      staffId,
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      department: department || '',
      role,
      status: 'active'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Staff member added successfully',
      staff: {
        id: newStaff._id,
        staffId: newStaff.staffId,
        email: newStaff.email,
        name: newStaff.name,
        department: newStaff.department,
        role: newStaff.role,
        status: newStaff.status,
      },
      tempPassword // Only send once for the admin to share
    });
  } catch (error: any) {
    console.error('Error adding staff:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}