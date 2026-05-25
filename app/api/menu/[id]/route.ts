import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import { getSessionFromRequest } from '@/lib/auth-cookies';
import { z } from 'zod';

const categories = ['Swallow', 'Fast Food', 'Vegetarian', 'Nigerian Special', 'Rice Dishes', 'Soups & Stews', 'Beverages', 'Desserts'] as const;

const updateMenuSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(5).max(500).optional(),
  price: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
  category: z.enum(categories).optional(),
  imageUrl: z.string().url().optional(),
  available: z.boolean().optional(),
});

// GET - Fetch single menu item
export async function GET(
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
    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      menuItem,
    });
  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update menu item (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    const validation = updateMenuSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const { id } = await params;
    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      validation.data,
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem,
    });
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu item (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    const menuItem = await MenuItem.findByIdAndDelete(id);
    
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}