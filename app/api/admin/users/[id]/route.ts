import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const { password, isClaimed, assignedReward } = body

        const data: any = {}
        if (password) {
            data.password = await hashPassword(password)
        }
        if (typeof isClaimed !== 'undefined') {
            data.isClaimed = isClaimed
        }
        if (typeof assignedReward !== 'undefined') {
            data.assignedReward = assignedReward
        }

        const user = await prisma.user.update({
            where: { id },
            data,
        })

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'Error updating user' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.user.delete({
            where: { id },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 })
    }
}
