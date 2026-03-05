import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('snewroof_session');

    // Protect all /dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!sessionCookie) {
            // Redirect unauthenticated users to login page
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
