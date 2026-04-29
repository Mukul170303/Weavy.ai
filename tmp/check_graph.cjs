const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const run = await prisma.workflowRun.findFirst({
        orderBy: { startedAt: "desc" },
        include: { workflow: true }
    });
    console.log("Run ID:", run.id);
    console.log("Selected Nodes:", run.selectedNodeIds);
    console.log("Graph Data Snippet:", run.workflow.data.substring(0, 500));

    const graph = JSON.parse(run.workflow.data);
    console.log("Node Count:", graph.nodes?.length);
    console.log("Edge Count:", graph.edges?.length);
}
main().finally(() => prisma.$disconnect());
