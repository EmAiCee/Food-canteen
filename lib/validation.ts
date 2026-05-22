import { z } from 'zod';

// User validation
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Staff ID or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createStaffSchema = z.object({
  staffId: z.string().min(3, 'Staff ID must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().optional(),
  role: z.enum(['staff', 'admin']).default('staff'),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  role: z.enum(['staff', 'admin']).optional(),
});

// Menu item validation
export const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.enum(['Main Course', 'Fast Food', 'Vegetarian', 'Dessert', 'Beverages']),
  available: z.boolean().default(true),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0).optional(),
  category: z.enum(['Main Course', 'Fast Food', 'Vegetarian', 'Dessert', 'Beverages']).optional(),
  available: z.boolean().optional(),
});

// Order validation
export const createOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
  })),
  deliveryNote: z.string().optional(),
  deliveryLocation: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
});