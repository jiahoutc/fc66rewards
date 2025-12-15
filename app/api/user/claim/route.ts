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

        // 2. Check for SPECIFIC ASSIGNMENT first
        const assignment = await prisma.rewardAssignment.findFirst({
            where: { userId: id, status: 'ASSIGNED' },
            include: { reward: true }
        })

        let targetReward: any = null
        let isAssigned = false

        if (assignment) {
            targetReward = assignment.reward
            isAssigned = true
        } else {
            // 3. Logic for Random Reward
            // Get available rewards (Stock > 0 or -1)
            const targetCategory = category || 'BOX'
            const rewards = await prisma.reward.findMany({
                where: {
                    category: targetCategory as any,
                    OR: [{ stock: { gt: 0 } }, { stock: -1 }]
                }
            })

            if (rewards.length === 0) {
                return NextResponse.json({ error: `No rewards available for ${targetCategory}` }, { status: 500 })
            }

            // Pick random reward
            targetReward = rewards[Math.floor(Math.random() * rewards.length)]
        }

        // 4. Determine Cost (Game Entry Fee vs Reward Price)
        // If assigned, cost is usually 0 or specific, but lets assume standard Game Mode cost applies unless overridden.
        // For strict category pricing, we look up the GameMode.
        const currentCategory = targetReward.category
        let costPrice = 0

        try {
            // Look up GameMode cost
            const gameMode = await prisma.gameMode.findUnique({
                where: { category: currentCategory }
            })
            // If gameMode exists, use its cost. If not found (shouldn't happen with lazy init), fallback to reward.price or 1
            costPrice = gameMode ? gameMode.cost : (targetReward.price || 1)

            // Optional: If game is disabled, block play?
            if (gameMode && !gameMode.enabled) {
                return NextResponse.json({ error: 'This game is currently disabled' }, { status: 403 })
            }

        } catch (e) {
            // Fallback if table doesn't exist yet/error
            costPrice = targetReward.price || 1
        }

        // Validation: credits >= cost
        if (user.credits < costPrice) {
            return NextResponse.json({ error: `Not enough credits. Game costs ${costPrice}, you have ${user.credits}` }, { status: 403 })
        }

        await prisma.$transaction([
            // Decrement User Credits by Cost
            prisma.user.update({
                where: { id },
                data: { credits: { decrement: costPrice } }
            }),
            // Create Credit History (Spend)
            prisma.creditHistory.create({
                data: {
                    userId: id,
                    amount: -costPrice,
                    type: 'SPEND',
                    description: `Played ${currentCategory} (Won: ${targetReward.name})`
                }
            }),
            // Decrement Reward Stock (if not infinite AND not previously assigned)
            ...(targetReward.stock !== -1 ? [
                prisma.reward.update({
                    where: { id: targetReward.id },
                    data: { stock: { decrement: 1 } }
                })
            ] : []),
            // Create Claim Record
            prisma.claim.create({
                data: {
                    userId: id,
                    rewardName: targetReward.name,
                    category: targetReward.category
                }
            }),
            // If it was an assignment, mark it as CLAIMED
            ...(isAssigned ? [
                prisma.rewardAssignment.update({
                    where: { id: assignment!.id },
                    data: {
                        status: 'CLAIMED',
                        claimedAt: new Date()
                    }
                })
            ] : []),
            // Update Legacy Fields
            prisma.user.update({
                where: { id },
                data: {
                    isClaimed: true,
                    assignedReward: targetReward.name,
                    playedGame: targetReward.category
                }
            })
        ])

        return NextResponse.json({ success: true, reward: targetReward })


    } catch (error: any) {
        console.error('Claim API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
