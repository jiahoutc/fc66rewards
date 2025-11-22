import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

export async function GET() {
    try {
        // 1. Create Admin User
        const hashedPassword = await hashPassword('admin123')
        const admin = await prisma.admin.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: hashedPassword,
            },
        })

        // 2. Create Initial Config
        await prisma.config.upsert({
            where: { key: 'backgroundImageUrl' },
            update: {},
            create: {
                key: 'backgroundImageUrl',
                value: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop',
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully!',
            admin: { username: admin.username }
        })
    } catch (error: any) {
        return NextResponse.json({
            error: 'Initialization Failed',
            details: error.message
        }, { status: 500 })
    }
}
