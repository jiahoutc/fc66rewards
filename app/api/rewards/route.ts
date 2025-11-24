import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const rewards = await prisma.reward.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(rewards)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, imageUrl, category } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const reward = await prisma.reward.create({
            data: {
                name,
                imageUrl,
                category: category || 'BOX',
                stock: body.stock || 1,
            },
        })

        return NextResponse.json(reward)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating reward' }, { status: 500 })
    }
}
