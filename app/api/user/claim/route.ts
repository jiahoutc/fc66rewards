import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id, category } = body // category is optional, defaults to BOX

        // Verify user exists and hasn't claimed
        const user = await prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (user.isClaimed) {
            return NextResponse.json({ error: 'Already claimed', reward: user.assignedReward }, { status: 400 })
        }

        // Get rewards for this category
        const targetCategory = category || 'BOX'
        const rewards = await prisma.reward.findMany({
            where: { category: targetCategory }
        })

        if (rewards.length === 0) {
            return NextResponse.json({ error: `No rewards available for ${targetCategory}` }, { status: 500 })
        }

        // Pick random reward
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)]

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                isClaimed: true,
                assignedReward: randomReward.name,
                playedGame: targetCategory,
            },
        })

        return NextResponse.json({ success: true, reward: randomReward })
    } catch (error: any) {
        console.error('Claim API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
