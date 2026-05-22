import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🟢 Testing database connection...');
    
    await connectDB();
    
    console.log('✅ Database connected successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}