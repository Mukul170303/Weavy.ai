import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');

    if (!workflowId) {
        return NextResponse.json({ error: 'workflowId is required' }, { status: 400 });
    }

    try {
        const executions = await prisma.nodeExecution.findMany({
            where: {
                run: {
                    workflowId: parseInt(workflowId)
                }
            },
            orderBy: {
                startedAt: 'desc'
            }
        });

        return NextResponse.json(executions);
    } catch (error) {
        console.error('Error fetching workflow history:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
