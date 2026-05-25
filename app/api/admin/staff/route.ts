import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { getSessionFromRequest } from '@/lib/auth-cookies';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const createStaffSchema = z.object({
  staffId: z.string().regex(/^[A-Z0-9]+$/i, 'Staff ID must contain only letters and numbers'),
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().optional(),
  role: z.enum(['staff', 'admin']).default('staff'),
});

export async function GET(req: NextRequest) {
  try {
    // Use cookie-based session
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const staff = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Use cookie-based session
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    
    const validation = createStaffSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors[0].message },
        { status: 400 }
      );
    }

    const { staffId, email, name, department, role } = validation.data;
    
    await connectDB();
    
    // Check for duplicates
    const existingStaff = await User.findOne({
      $or: [{ staffId: staffId.toUpperCase() }, { email: email.toLowerCase() }]
    });
    
    if (existingStaff) {
      const field = existingStaff.staffId === staffId.toUpperCase() ? 'Staff ID' : 'Email';
      return NextResponse.json(
        { error: `${field} already exists. Please use a different one.` },
        { status: 400 }
      );
    }
    
    // Create staff with fixed temporary password
    const tempPassword = 'password123';
    const hashedPassword = await hashPassword(tempPassword);
    
    const newStaff = await User.create({
      staffId: staffId.toUpperCase(),
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
      tempPassword
    });
  } catch (error: any) {
    console.error('Error adding staff:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field === 'staffId' ? 'Staff ID' : 'Email'} already exists. Please use a different one.` },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}