
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({ where: { phone: '0987654321' } });
    if (!user) return;

    const byproduct = await prisma.byProduct.findFirst({ where: { userId: user.id } });
    if (!byproduct) return;

    // Get last 2 entries (User Question + AI Response)
    const entries = await prisma.timelineEntry.findMany({
        where: { byproductId: byproduct.id },
        orderBy: { timestamp: 'desc' },
        take: 2 // Assuming the last turn consists of 2 messages
    });

    if (entries.length > 0) {
        console.log(`Found ${entries.length} entries to delete.`);
        // Check if they match the "start date" or similar? 
        // Actually just deleting the last 2 is safe for "undoing" the last turn.
        for (const e of entries) {
            console.log(`Deleting: [${e.role}] ${e.content.substring(0, 20)}...`);
            await prisma.timelineEntry.delete({ where: { id: e.id } });
        }
        console.log('✨ Cleaned last turn successfully.');
    }
}

main().finally(() => prisma.$disconnect());
