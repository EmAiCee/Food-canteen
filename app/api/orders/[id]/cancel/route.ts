import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getSessionFromRequest } from '@/lib/auth-cookies';
import { sendOrderCancelledAdminEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { id } = await params;
    const order = await Order.findOne({ _id: id, staffId: session.userId });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Only allow cancellation if status is pending or confirmed
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return NextResponse.json(
        { error: `Cannot cancel order that is already ${order.status}` },
        { status: 400 }
      );
    }
    
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();
    
    // ✅ Notify admin about cancellation
    await sendOrderCancelledAdminEmail(
      process.env.ADMIN_EMAIL || 'admin@nngw.com',
      order.orderNumber,
      order.staffName,
      order.staffEmail
    );
    
    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}