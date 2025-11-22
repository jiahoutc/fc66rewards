import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { id: 'jiahouting' },
    })

    if (!user) {
        console.log('User jiahouting NOT found!')
        return
    }

    console.log('User found:', user)

    const isMatch = await bcrypt.compare('123456', user.password)
    console.log('Password "123456" match:', isMatch)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
