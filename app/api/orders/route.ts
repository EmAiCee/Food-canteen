import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import MenuItem from '@/models/MenuItem';
import { getSessionFromRequest } from '@/lib/auth-cookies';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const orders = await Order.find({ staffId: session.userId })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { items, deliveryLocation, deliveryNote } = body;
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    
    if (!deliveryLocation) {
      return NextResponse.json({ error: 'Delivery location required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Verify items still exist and get current prices
    let totalAmount = 0;
    const verifiedItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.id);
      if (!menuItem || !menuItem.available) {
        return NextResponse.json(
          { error: `${item.name} is no longer available` },
          { status: 400 }
        );
      }
      verifiedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });
      totalAmount += menuItem.price * item.quantity;
    }
    
    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `NNGW-${String(orderCount + 1).padStart(4, '0')}`;
    
    const order = await Order.create({
      orderNumber,
      staffId: session.userId,
      staffName: session.name,
      staffEmail: session.email,
      staffDepartment: session.department || '',
      deliveryLocation,
      deliveryNote: deliveryNote || '',
      items: verifiedItems,
      totalAmount,
      status: 'pending',
    });
    
    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}