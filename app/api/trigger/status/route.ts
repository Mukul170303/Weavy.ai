import { NextResponse } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

const statusSchema = z.object({
    runId: z.string().min(1),
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');

    // 1. Validate with Zod
    const result = statusSchema.safeParse({ runId });
    if (!result.success) {
        return NextResponse.json({
            error: 'runId is required',
            details: result.error.flatten()
        }, { status: 400 });
    }

    try {
        const run = await runs.retrieve(result.data.runId);
        return NextResponse.json(run);
    } catch (error) {
        console.error('Error fetching run status:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
