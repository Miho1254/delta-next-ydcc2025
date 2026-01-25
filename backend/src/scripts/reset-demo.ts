
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const phone = '0987654321';
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
        console.log('User not found');
        return;
    }

    // Delete "Rơm rạ" (Straw) items
    const deleted = await prisma.byProduct.deleteMany({
        where: {
            userId: user.id,
            name: { contains: 'Rơm rạ' }
        }
    });

    console.log(`✅ Deleted ${deleted.count} "Rơm rạ" items for user ${phone}.`);
    console.log('Ready for new Demo recording!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
