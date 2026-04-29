const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const workflowId = 11;
    const runs = await prisma.workflowRun.findMany({
        where: { workflowId },
        include: { executions: true },
        orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${runs.length} runs for Workflow #11`);
    runs.forEach((run, i) => {
        console.log(`Run ${i}: ID=${run.id}, Status=${run.status}, Executions=${run.executions.length}`);
        run.executions.forEach(exec => {
            console.log(`  - Node: ${exec.nodeId}, Status: ${exec.status}, Type: ${exec.nodeType}`);
            if (exec.outputData) {
                console.log(`    Output: ${exec.outputData.substring(0, 100)}...`);
            }
        });
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
