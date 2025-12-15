import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, rewardId } = body

        if (!userId || !rewardId) {
            return NextResponse.json({ error: 'User ID and Reward ID are required' }, { status: 400 })
        }

        // 1. Verify existence
        const user = await prisma.user.findUnique({ where: { id: userId } })
        const reward = await prisma.reward.findUnique({ where: { id: rewardId } })

        if (!user || !reward) {
            return NextResponse.json({ error: 'User or Reward not found' }, { status: 404 })
        }

        // 2. Transaction: Expire old assignments -> Create new one
        await prisma.$transaction([
            // Expire any currently active assignments for this user
            prisma.rewardAssignment.updateMany({
                where: {
                    userId,
                    status: 'ASSIGNED'
                },
                data: {
                    status: 'EXPIRED'
                }
            }),
            // Create new ACTIVE assignment
            prisma.rewardAssignment.create({
                data: {
                    userId,
                    rewardId,
                    status: 'ASSIGNED'
                }
            })
        ])

        return NextResponse.json({ success: true, message: `Reward ${reward.name} assigned to ${user.id}` })

    } catch (error: any) {
        console.error('Assignment Error:', error)
        return NextResponse.json({ error: 'Failed to assign reward' }, { status: 500 })
    }
}
