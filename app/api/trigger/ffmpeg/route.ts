import { NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.type === 'crop') {
            const handle = await tasks.trigger("crop-image", body);
            return NextResponse.json({ runId: handle.id });
        } else if (body.type === 'extract-frame') {
            const handle = await tasks.trigger("extract-frame", body);
            return NextResponse.json({ runId: handle.id });
        }

        return NextResponse.json({ error: 'Invalid task type' }, { status: 400 });
    } catch (error) {
        console.error('Error triggering ffmpeg task:', error);
        return NextResponse.json({ error: 'Failed to trigger task' }, { status: 500 });
    }
}
