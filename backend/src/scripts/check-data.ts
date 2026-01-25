
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { phone: '0987654321' },
        include: { byproducts: true }
    });
    console.log('CHECK_RESULT:', JSON.stringify(user, null, 2));
}

main().finally(() => prisma.$disconnect());
