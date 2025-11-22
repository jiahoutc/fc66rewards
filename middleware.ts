import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Protect Admin Routes
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        const adminSession = request.cookies.get('admin_session')
        if (!adminSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // Protect User Routes (optional, but good practice)
    // if (path.startsWith('/claim')) {
    //   const userSession = request.cookies.get('user_session')
    //   if (!userSession) {
    //     return NextResponse.redirect(new URL('/', request.url))
    //   }
    // }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
