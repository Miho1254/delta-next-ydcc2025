
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const phone = '0987654321';
    const user = await prisma.user.findUnique({
        where: { phone },
        include: { byproducts: { include: { timeline: true } } }
    });

    if (!user) {
        console.log('❌ User 0987654321 NOT FOUND');
        return;
    }

    console.log(`✅ User found: ${user.name}`);
    console.log(`📦 ByProducts count: ${user.byproducts.length}`);
    user.byproducts.forEach(bp => {
        console.log(` - [${bp.status}] ${bp.name} (Context: ${JSON.stringify(bp.contextData)})`);
        console.log(`   💬 Timeline items: ${bp.timeline.length}`);
        bp.timeline.forEach(t => console.log(`     -> [${t.role}] ${t.content.substring(0, 50)}... (${t.timestamp})`));
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
