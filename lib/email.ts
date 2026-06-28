import nodemailer from 'nodemailer';

// Configure email transporter using your .env variable names
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: `"NNGW Canteen" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
}

// Admin: New Order Alert
export async function sendNewOrderAdminEmail(to: string, orderNumber: string, staffName: string, totalAmount: number) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #2563eb; padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .info-box { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
        h2 { color: #1f2937; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 New Order Received</h1>
        </div>
        <div class="content">
          <h2>Admin Alert</h2>
          <p>A new order has been placed and requires confirmation.</p>
          
          <div class="info-box">
            <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> #${orderNumber}</p>
            <p style="margin: 0 0 10px 0;"><strong>Customer:</strong> ${staffName}</p>
            <p style="margin: 0;"><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
          </div>
          
          <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/orders" class="button">View & Confirm Order</a></p>
        </div>
        <div class="footer">
          <p>NNGW Canteen System • Admin Notification</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail({ to, subject: `📦 New Order #${orderNumber}`, html });
}

// Staff: Order Confirmed
export async function sendOrderConfirmedEmail(to: string, orderNumber: string, staffName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #2563eb; padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .order-details { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        h2 { color: #1f2937; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hello ${staffName},</h2>
          <p>Your order has been <strong style="color: #2563eb;">confirmed</strong> and is now being prepared.</p>
          
          <div class="order-details">
            <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> #${orderNumber}</p>
            <p style="margin: 0;">Our kitchen team is working on your meal.</p>
          </div>
          
          <p>You will receive another notification when your order is ready for delivery.</p>
        </div>
        <div class="footer">
          <p>NNGW Staff Canteen • Your Workplace Dining Solution</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail({ to, subject: `✅ Order #${orderNumber} Confirmed`, html });
}

// Staff: Order Ready
export async function sendOrderReadyEmail(to: string, orderNumber: string, staffName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #16a34a; padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .order-details { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        h2 { color: #1f2937; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ Order Ready for Delivery!</h1>
        </div>
        <div class="content">
          <h2>Hello ${staffName},</h2>
          <p>Your order is now <strong style="color: #16a34a;">ready for delivery</strong>!</p>
          
          <div class="order-details">
            <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> #${orderNumber}</p>
            <p style="margin: 0;">Our delivery team will bring your meal to your desk shortly.</p>
          </div>
          
          <p>Thank you for choosing NNGW Canteen!</p>
        </div>
        <div class="footer">
          <p>NNGW Staff Canteen • Your Workplace Dining Solution</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail({ to, subject: `🍽️ Order #${orderNumber} Ready for Delivery`, html });
}

// Admin: Order Cancelled
export async function sendOrderCancelledAdminEmail(to: string, orderNumber: string, staffName: string, staffEmail: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #dc2626; padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .info-box { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
        h2 { color: #1f2937; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Order Cancelled</h1>
        </div>
        <div class="content">
          <h2>Admin Alert</h2>
          <p>An order has been cancelled by the customer.</p>
          
          <div class="info-box">
            <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> #${orderNumber}</p>
            <p style="margin: 0 0 10px 0;"><strong>Customer Name:</strong> ${staffName}</p>
            <p style="margin: 0;"><strong>Customer Email:</strong> ${staffEmail}</p>
          </div>
          
          <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/orders" class="button">View Orders</a></p>
        </div>
        <div class="footer">
          <p>NNGW Canteen System • Admin Notification</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail({ to, subject: `⚠️ Order #${orderNumber} Cancelled`, html });
}