import { connectDB } from './mongodb';
import User from '@/models/User';
import { hashPassword } from './auth';

export async function seedAdminUser() {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nngw.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminStaffId = process.env.ADMIN_STAFF_ID || 'ADMIN001';

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    
    await User.create({
      staffId: adminStaffId,
      email: adminEmail,
      password: hashedPassword,
      name: 'System Administrator',
      department: 'IT',
      role: 'admin',
      status: 'active',
    });

    console.log('✅ Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } else {
    console.log('ℹ️ Admin user already exists');
  }
}