const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const executions = await prisma.nodeExecution.findMany({
        take: 5,
        orderBy: { startedAt: "desc" }
    });
    console.log(JSON.stringify(executions, null, 2));
}
main().finally(() => prisma.$disconnect());
