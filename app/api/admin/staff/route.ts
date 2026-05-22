import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

// GET - Fetch all staff members (Admin only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get all users except super admin password field
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

// POST - Add new staff member (Admin only)
export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { staffId, email, name, department, role = 'staff' } = body;
    
    // Validate required fields
    if (!staffId || !email || !name) {
      return NextResponse.json(
        { error: 'Staff ID, email, and name are required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if staff already exists
    const existingStaff = await User.findOne({
      $or: [{ staffId }, { email }]
    });
    
    if (existingStaff) {
      return NextResponse.json(
        { error: 'Staff ID or email already exists' },
        { status: 400 }
      );
    }
    
    // Create new staff member with default password
    const { hashPassword } = await import('@/lib/auth');
    const defaultPassword = await hashPassword('password123');
    
    const newStaff = await User.create({
      staffId,
      email: email.toLowerCase(),
      password: defaultPassword,
      name,
      department: department || '',
      role,
      status: 'active'
    });
    
    // Return without password
    const staffData = {
      id: newStaff._id,
      staffId: newStaff.staffId,
      email: newStaff.email,
      name: newStaff.name,
      department: newStaff.department,
      role: newStaff.role,
      status: newStaff.status,
      createdAt: newStaff.createdAt
    };
    
    return NextResponse.json({
      success: true,
      message: 'Staff member added successfully',
      staff: staffData,
      tempPassword: 'password123' // Send temp password for first login
    });
  } catch (error: any) {
    console.error('Error adding staff:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}