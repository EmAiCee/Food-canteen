import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-cookies';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const user = await User.findById(session.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      user: {
        id: user._id,
        staffId: user.staffId,
        email: user.email,
        name: user.name,
        department: user.department,
        role: user.role,
        status: user.status,
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}