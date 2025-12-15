import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List all game modes (auto-create if missing)
export async function GET() {
    try {
        const categories = ['BOX', 'WHEEL', 'PLINKO', 'SCRATCH']
        const modes = []

        for (const cat of categories) {
            // Upsert ensures it exists
            const mode = await prisma.gameMode.upsert({
                where: { category: cat as any },
                update: {},
                create: {
                    category: cat as any,
                    cost: 10, // Default cost
                    enabled: true
                }
            })
            modes.push(mode)
        }

        return NextResponse.json(modes)
    } catch (error) {
        console.error('GameMode GET Error:', error)
        return NextResponse.json({ error: 'Failed to fetch game modes' }, { status: 500 })
    }
}

// PUT: Update a specific game mode
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, cost, enabled } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const mode = await prisma.gameMode.update({
            where: { id },
            data: {
                cost: cost !== undefined ? Number(cost) : undefined,
                enabled: enabled !== undefined ? Boolean(enabled) : undefined
            }
        })

        return NextResponse.json(mode)
    } catch (error) {
        console.error('GameMode PUT Error:', error)
        return NextResponse.json({ error: 'Failed to update game mode' }, { status: 500 })
    }
}
