import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('123456', 10)

    const user = await prisma.user.update({
        where: { id: 'jiahouting' },
        data: { password: hashedPassword },
    })

    console.log('Password reset for jiahouting to 123456')
    console.log('New hash:', user.password)
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
