import { PrismaClient, ByProductStatus } from '@prisma/client';
const prisma = new PrismaClient();

const MANUAL_TIMEOUT = 1000; // 1s between items for order

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const phone = '0987654321';
    console.log('🌱 Starting Manual Seed (No AI Dependency)...');

    // 1. Cleaner
    const user = await prisma.user.upsert({
        where: { phone },
        update: {},
        create: {
            phone,
            name: 'Bác Ba Phi',
            // No role field in schema
        }
    });

    await prisma.byProduct.deleteMany({
        where: { userId: user.id, name: { contains: 'Rơm rạ' } }
    });
    console.log('🧹 Cleaned old data.');

    // 2. Create Product
    const product = await prisma.byProduct.create({
        data: {
            userId: user.id,
            name: 'Đống Rơm rạ vụ Đông Xuân',
            type: 'Rơm rạ',
            status: ByProductStatus.processing,
            location: '10.045,105.746', // Can Tho
            startImageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2940&auto=format&fit=crop',
            contextData: {
                amount: 500,
                unit: 'kg',
                description: 'Rơm thu hoạch xong, ủ tại ruộng.'
            }
        }
    });
    console.log('🌾 Created Product:', product.name);

    // 3. Insert Conversation (Hardcoded)
    const conversation = [
        {
            role: 'user',
            content: 'Tui mới chất đống rơm này hôm qua, tính ủ làm phân bón lúa vụ tới. Giờ tui cần làm gì đầu tiên hả cô AI?',
            offset: 5 * 24 * 60 * 60 * 1000 // 5 days ago
        },
        {
            role: 'model',
            content: 'Dạ, con chào Bác Ba Phi hen! 🌾\n\nỦ rơm làm phân là quá chuẩn luôn bác ơi. Mới chất đống hôm qua thì bước đầu tiên quan trọng nhất là bác kiểm tra **độ ẩm** giúp con nha.\n\nBác thử thò tay vô giữa đống rơm rút ra một nắm, bóp chặt lạ thử:\n- Nếu thấy nước rỉ ra kẽ tay: Là hơi dư nước, bác cần banh ra phơi xíu.\n- Nếu bóp xong buông ra rơm tơi tả: Là khô quá, bác tưới thêm nước vô nha.\n\nChuẩn nhất là rơm ẩm mát rượi mà không rỉ nước. Xong rồi bác nhớ đậy bạt hoặc lá chuối lên để giữ nhiệt nhé bác!',
            offset: 5 * 24 * 60 * 60 * 1000 - 10000
        },
        {
            role: 'user',
            content: 'Tui có tưới nước rồi, mà sao thấy nước nó chảy tong tong ra ngoài, vậy là dư nước hả?',
            offset: 4 * 24 * 60 * 60 * 1000 // 4 days ago
        },
        {
            role: 'model',
            content: 'Dạ đúng rồi bác ơi! Nước chảy tong tong là dư nhiều rồi đó bác. 💧\n\nDư nước quá thì đống ủ dễ bị thối (mùi chua) thay vì mục thơm đó. Giờ bác:\n1. Ngưng tưới liền.\n2. Nếu có thể, bác xới đảo sơ qua cho nó thoáng khí, nước bốc hơi bớt.\n3. Khơi rãnh xung quanh chân đống ủ để nước thừa thoát đi, đừng để nó ngấm ngược vô nha bác.\n\nMai bác kiểm tra lại thấy rơm ráo ráo là đẹp ạ!',
            offset: 4 * 24 * 60 * 60 * 1000 - 10000
        },
        {
            role: 'user',
            content: 'Nay sờ vô đống ủ thấy nóng hổi luôn, chắc luộc trứng được luôn quá. Có sao không cô?',
            offset: 2 * 24 * 60 * 60 * 1000 // 2 days ago
        },
        {
            role: 'model',
            content: 'Mừng quá bác ơi! Nóng hổi vậy là **tốt lắm** đó bác! 🔥\n\nNhiệt độ cao (có khi lên tới 60-70 độ C) chứng tỏ vi sinh vật đang hoạt động cực mạnh để phân hủy rơm đó bác. Nhiệt độ này còn giúp diệt mầm cỏ dại với vi khuẩn có hại nữa.\n\nBác cứ để yên cho nó nóng vậy khoảng 1 tuần rồi mình đảo trộn sau nha. Nếu thấy khô quá (do nóng bốc hơi) thì bác hãy tưới sương sương bù ẩm thôi nhé.',
            offset: 2 * 24 * 60 * 60 * 1000 - 10000
        },
        {
            role: 'user',
            content: 'Giờ tui muốn trộn thêm ít phân bò với nấm Trichoderma vô cho nó mau mục, được hông?',
            offset: 5 * 60 * 1000 // 5 mins ago (Latest)
        },
        {
            role: 'model',
            content: 'Dạ ý tưởng quá hay luôn bác! Thêm phân bò (đạm) + nấm Trichoderma là "cặp bài trùng" giúp rơm mục nát nhanh thần tốc.\n\nTuy nhiên bác **lưu ý kỹ** giúp con chỗ này:\n- Đống ủ đang nóng hổi (như bác kể hôm kia) mà bỏ nấm Trichoderma vô liền là nấm chết queo uổng tiền lắm đó bác. Nấm này chịu nóng dở lắm.\n\n👉 **Cách làm tốt nhất:**\n1. Bác chờ thêm vài ngày nữa cho nhiệt hạ bớt (còn ấm ấm tay).\n2. Lúc đảo đống ủ lần đầu, bác hãy trộn phân bò + nấm Trichoderma vô luôn thể.\n\nGiờ bác cứ chuẩn bị sẵn phân bò với nấm đi, vài bữa nữa mình "đánh nhanh thắng nhanh" nha bác! 💪',
            offset: 5 * 60 * 1000 - 10000
        }
    ];

    const now = Date.now();

    for (const turn of conversation) {
        await prisma.timelineEntry.create({
            data: {
                byproductId: product.id,
                role: turn.role,
                content: turn.content,
                timestamp: BigInt(now - turn.offset), // Fix BigInt
                metadata: {
                    source: 'manual_seed_v1',
                    ...(turn.role === 'model' ? { regionConfig: 'mekong_delta' } : {})
                }
            }
        });
    }

    console.log('✅ Manual Seed Complete! No API Quota used.');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
