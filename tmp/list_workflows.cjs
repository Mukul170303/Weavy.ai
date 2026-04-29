const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const workflows = await prisma.workflow.findMany({
        take: 10,
        orderBy: { id: "desc" }
    });
    console.log(JSON.stringify(workflows, null, 2));
}
main().finally(() => prisma.$disconnect());
