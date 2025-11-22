import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_session')?.value

        if (!userId) {
            return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
