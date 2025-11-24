import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id, category } = body // category is optional, defaults to BOX

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Verify user exists and hasn't claimed
        const user = await prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 1. Check Credits
        if (user.credits < 1) {
            return NextResponse.json({ error: 'No credits remaining' }, { status: 403 })
        }

        // 2. Get available rewards (Stock > 0 or -1)
        const targetCategory = category || 'BOX'
        const rewards = await prisma.reward.findMany({
            where: {
                category: targetCategory,
                OR: [
                    { stock: { gt: 0 } },
                    { stock: -1 }
                ]
            }
        })

        if (rewards.length === 0) {
            return NextResponse.json({ error: `No rewards available for ${targetCategory}` }, { status: 500 })
        }

        // 3. Pick random reward
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)]

        // 4. Transaction: Decrement Credits, Decrement Stock, Create Claim
        await prisma.$transaction([
            // Decrement User Credits
            prisma.user.update({
                where: { id },
                data: { credits: { decrement: 1 } }
            }),
            // Decrement Reward Stock (if not infinite)
            ...(randomReward.stock !== -1 ? [
                prisma.reward.update({
                    where: { id: randomReward.id },
                    data: { stock: { decrement: 1 } }
                })
            ] : []),
            // Create Claim Record
            prisma.claim.create({
                data: {
                    userId: id,
                    rewardName: randomReward.name,
                    category: targetCategory
                }
            }),
            // Update Legacy Fields (Optional, for backward compatibility)
            prisma.user.update({
                where: { id },
                data: {
                    isClaimed: true,
                    assignedReward: randomReward.name,
                    playedGame: targetCategory
                }
            })
        ])

        return NextResponse.json({ success: true, reward: randomReward })

        return NextResponse.json({ success: true, reward: randomReward })
    } catch (error: any) {
        console.error('Claim API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
