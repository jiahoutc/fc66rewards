import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const configs = await prisma.config.findMany()
        const configMap = configs.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)
        return NextResponse.json(configMap)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        // body is { key: value, key2: value2 }

        const updates = Object.entries(body).map(([key, value]) => {
            return prisma.config.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            })
        })

        await prisma.$transaction(updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error updating config' }, { status: 500 })
    }
}
