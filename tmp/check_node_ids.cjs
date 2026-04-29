const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const wf = await prisma.workflow.findUnique({
        where: { id: 19 }
    });
    const data = JSON.parse(wf.data);
    console.log("Nodes in Workflow 19:");
    data.nodes.forEach(n => console.log(`- ${n.id} (${n.type})`));
}
main().finally(() => prisma.$disconnect());
