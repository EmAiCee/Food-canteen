import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getSessionFromRequest } from '@/lib/auth-cookies';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { paymentMethod } = await req.json();
    
    await connectDB();
    
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Only allow marking as paid for delivered orders
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Order must be delivered before marking as paid' },
        { status: 400 }
      );
    }
    
    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod || 'cash';
    order.paidAt = new Date();
    order.collectedBy = session.name;
    await order.save();
    
    return NextResponse.json({
      success: true,
      message: 'Payment marked as collected',
      order,
    });
  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}