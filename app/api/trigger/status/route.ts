import { NextResponse } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');

    if (!runId) {
        return NextResponse.json({ error: 'runId is required' }, { status: 400 });
    }

    try {
        const run = await runs.retrieve(runId);
        return NextResponse.json(run);
    } catch (error) {
        console.error('Error fetching run status:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
