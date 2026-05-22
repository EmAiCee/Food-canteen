import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    console.log('🟢 Starting seed process...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@nngw.com' });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists!'
      });
    }
    
    // Create admin user
    const adminPassword = await hashPassword('Admin@123');
    const admin = await User.create({
      staffId: 'ADMIN001',
      email: 'admin@nngw.com',
      password: adminPassword,
      name: 'System Administrator',
      department: 'IT',
      role: 'admin',
      status: 'active',
    });
    console.log('✅ Admin user created');
    
    // Create test staff
    const staffPassword = await hashPassword('staff123');
    const staff = await User.create({
      staffId: 'NNGW1001',
      email: 'staff@nngw.com',
      password: staffPassword,
      name: 'Test Staff',
      department: 'Engineering',
      role: 'staff',
      status: 'active',
    });
    console.log('✅ Test staff created');
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      users: {
        admin: { email: admin.email, staffId: admin.staffId },
        staff: { email: staff.email, staffId: staff.staffId }
      }
    });
  } catch (error: any) {
    console.error('❌ Seed error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}