import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import { getSessionFromRequest } from '@/lib/auth-cookies';
import { z } from 'zod';

// Updated categories for Nigerian foods
const categories = ['Swallow', 'Fast Food', 'Vegetarian', 'Rice Dishes', 'Soups & Stews', 'Beverages', 'Desserts'] as const;

const createMenuSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500),
  price: z.union([z.number(), z.string()]).transform((val) => Number(val)),
  category: z.enum(categories),
  imageUrl: z.string().optional(),
  available: z.boolean().default(true),
});

// GET - Fetch all menu items
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');
    const search = searchParams.get('search');
    
    let query: any = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (available === 'true') {
      query.available = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      menuItems,
    });
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new menu item
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('Received body:', body);
    
    const validation = createMenuSchema.safeParse(body);
    if (!validation.success) {
      console.log('Validation errors:', validation.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const menuItem = await MenuItem.create(validation.data);
    
    return NextResponse.json({
      success: true,
      message: 'Menu item created successfully',
      menuItem,
    });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}