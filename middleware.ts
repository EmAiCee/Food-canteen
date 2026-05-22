import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from './lib/auth-cookies';
import { rateLimit } from './lib/rate-limit';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/about', '/contact', '/api/auth/login'];
// Routes that require admin access
const adminRoutes = ['/admin', '/api/admin'];

// ✅ For middleware.ts, export "middleware" function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  // ========== SECURITY HEADERS ==========
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:;"
  );
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  response.headers.delete('X-Powered-By');
  
  // ========== RATE LIMITING ==========
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(ip);
    
    if (!rateLimitResult.success) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // ========== AUTHENTICATION CHECK ==========
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  if (!isPublicRoute) {
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (isAdminRoute && session.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};