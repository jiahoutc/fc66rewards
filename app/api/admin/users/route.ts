import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id, password } = body

        if (!id || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                id,
                password: hashedPassword,
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'User already exists or error creating user' }, { status: 500 })
    }
}
