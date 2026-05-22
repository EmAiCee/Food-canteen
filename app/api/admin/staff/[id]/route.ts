import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { name, department, role, status } = body;
    
    await connectDB();
    
    const { id } = await params;
    
    const updatedStaff = await User.findByIdAndUpdate(
      id,
      { name, department, role, status },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');
    
    if (!updatedStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully',
      staff: updatedStaff
    });
  } catch (error: any) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { id } = await params;
    
    const deletedStaff = await User.findByIdAndDelete(id);
    
    if (!deletedStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}