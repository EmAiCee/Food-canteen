import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getSessionFromRequest } from '@/lib/auth-cookies';
import { sendOrderConfirmedEmail, sendOrderReadyEmail } from '@/lib/email';

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
    const { status } = await req.json();
    
    await connectDB();
    
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const oldStatus = order.status;
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    await order.save();
    
    // Send notifications based on status change
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      // Notify staff: Order confirmed
      await sendOrderConfirmedEmail(order.staffEmail, order.orderNumber, order.staffName);
    }
    
    if (status === 'ready' && oldStatus !== 'ready') {
      // Notify staff: Order ready
      await sendOrderReadyEmail(order.staffEmail, order.orderNumber, order.staffName);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}