
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({ where: { phone: '0987654321' } });
    if (!user) return;

    const byproduct = await prisma.byProduct.findFirst({ where: { userId: user.id } });
    if (!byproduct) return;

    // Check last message
    const lastEntry = await prisma.timelineEntry.findFirst({
        where: { byproductId: byproduct.id },
        orderBy: { timestamp: 'desc' }
    });

    if (lastEntry && lastEntry.role === 'user') {
        console.log('Fixing missing AI response...');
        await prisma.timelineEntry.create({
            data: {
                byproductId: byproduct.id,
                timestamp: Number(lastEntry.timestamp) + 5000,
                role: 'model',
                content: "Dạ khoảng 7-10 ngày nữa là bác đảo được rồi ạ. Lúc đó bác nhớ kiểm tra độ ẩm, nếu khô thì tưới thêm ít nước, còn nóng quá thì dỡ ra cho nguội bớt rồi ủ lại nghen.",
                metadata: {
                    suggestedQuestions: ["Cảm ơn con", "Làm sao biết đủ ẩm?"]
                }
            }
        });
        console.log('Fixed!');
    } else {
        console.log('No fix needed.');
    }
}

main().finally(() => prisma.$disconnect());
