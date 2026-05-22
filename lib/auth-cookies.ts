import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export interface SessionPayload {
  userId: string;
  staffId: string;
  email: string;
  role: string;
  name: string;
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  // AWAIT cookies() - it's a Promise in Next.js 16
  const cookieStore = await cookies();
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  return token;
}

export async function getSession() {
  // AWAIT cookies() - it's a Promise in Next.js 16
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;
  
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token) return null;
  
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete('session');
  return response;
}