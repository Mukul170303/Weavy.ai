import { NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

const ffmpegSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('crop'),
        sourceUrl: z.string().url(),
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        width: z.number().min(1).max(100),
        height: z.number().min(1).max(100),
        nodeId: z.string(),
        userId: z.string().optional(),
    }),
    z.object({
        type: z.literal('extract-frame'),
        sourceUrl: z.string().url(),
        timestamp: z.string(),
        nodeId: z.string(),
        userId: z.string().optional(),
    })
]);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Validate with Zod
        const result = ffmpegSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({
                error: 'Invalid request data',
                details: result.error.issues
            }, { status: 400 });
        }

        const data = result.data;

        if (data.type === 'crop') {
            const handle = await tasks.trigger("crop-image", data);
            return NextResponse.json({ runId: handle.id });
        } else if (data.type === 'extract-frame') {
            const handle = await tasks.trigger("extract-frame", data);
            return NextResponse.json({ runId: handle.id });
        }

        return NextResponse.json({ error: 'Invalid task type' }, { status: 400 });
    } catch (error) {
        console.error('Error triggering ffmpeg task:', error);
        return NextResponse.json({ error: 'Failed to trigger task' }, { status: 500 });
    }
}
