import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Add/Admin Adjustment of Credits
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, amount, description } = body

        if (!userId || typeof amount !== 'number') {
            return NextResponse.json({ error: 'User ID and Amount are required' }, { status: 400 })
        }

        const adjustment = parseInt(amount as any)

        // Transaction: Update User Credits + Create History Record
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    credits: { increment: adjustment }
                }
            })

            const history = await tx.creditHistory.create({
                data: {
                    userId,
                    amount: adjustment,
                    type: 'ADMIN_ADJUSTMENT',
                    description: description || 'Admin manual adjustment'
                }
            })

            return { user, history }
        })

        return NextResponse.json({ success: true, newBalance: result.user.credits })

    } catch (error: any) {
        console.error('Credit Adjustment Error:', error)
        return NextResponse.json({ error: 'Failed to adjust credits' }, { status: 500 })
    }
}

// GET: Get Credit History for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const history = await prisma.creditHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        return NextResponse.json({ history })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
