import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id } = body

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

        // Get all rewards
        const rewards = await prisma.reward.findMany()

        if (rewards.length === 0) {
            return NextResponse.json({ error: 'No rewards available' }, { status: 500 })
        }

        // Pick random reward
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)]

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                isClaimed: true,
                assignedReward: randomReward.name,
            },
        })

        return NextResponse.json({ success: true, reward: randomReward })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
