const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const runs = await prisma.workflowRun.findMany({
        take: 5,
        orderBy: { startedAt: "desc" }
    });
    console.log(JSON.stringify(runs, null, 2));
}
main().finally(() => prisma.$disconnect());
