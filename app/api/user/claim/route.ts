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
            where: {
                userId: id,
                status: 'ASSIGNED'
            },
            include: {
                reward: true
            }
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
                    OR: [
                        { stock: { gt: 0 } },
                        { stock: -1 }
                    ]
                }
            })

            if (rewards.length === 0) {
                return NextResponse.json({ error: `No rewards available for ${targetCategory}` }, { status: 500 })
            }

            // Pick random reward
            targetReward = rewards[Math.floor(Math.random() * rewards.length)]
        }


        // 4. Transaction: Decrement Credits (Price), Decrement Stock, Create Claim, Update Assignment, Log History
        const price = targetReward.price || 1 // Default to 1 if no price set

        // Validation: credits >= price
        if (user.credits < price) {
            return NextResponse.json({ error: `Not enough credits. Reward costs ${price}, you have ${user.credits}` }, { status: 403 })
        }

        await prisma.$transaction([
            // Decrement User Credits by Price
            prisma.user.update({
                where: { id },
                data: { credits: { decrement: price } }
            }),
            // Create Credit History (Spend)
            prisma.creditHistory.create({
                data: {
                    userId: id,
                    amount: -price,
                    type: 'SPEND',
                    description: `Claimed ${targetReward.name} (${targetReward.category})`
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
