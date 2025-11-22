import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword } from '@/lib/password'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = body
        const admin = await prisma.admin.findUnique({
            where: { username },
        })

        if (!admin) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const isValid = await comparePassword(password, admin.password)

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const response = NextResponse.json({ success: true })
        response.cookies.set('admin_session', 'true', { httpOnly: true, path: '/' })

        return response
    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message || String(error)
        }, { status: 500 })
    }
}
