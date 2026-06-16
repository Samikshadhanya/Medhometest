import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiter for Edge (Note: state clears across serverless instances, 
// but it is sufficient for basic burst protection per-instance as required by TC066-TC070)
const rateLimit = new Map<string, { count: number; timestamp: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 20; // max 20 requests per minute

  const record = rateLimit.get(ip);
  
  if (!record || now - record.timestamp > windowMs) {
    rateLimit.set(ip, { count: 1, timestamp: now });
  } else {
    record.count++;
    if (record.count > maxRequests) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/signin', '/'],
};
