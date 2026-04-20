import { NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // This maps to the `aiGenerator` task id "generate-text" 
        // in trigger/workflow-nodes.ts
        const handle = await tasks.trigger("generate-text", {
            prompt: body.prompt,
            systemPrompt: body.systemPrompt,
            imageUrls: body.imageUrls,
            model: body.model,
            temperature: body.temperature
        });

        return NextResponse.json({ runId: handle.id });
    } catch (error: any) {
        console.error('Error triggering LLM task:', error);
        return NextResponse.json({ error: error.message || 'Failed to trigger task' }, { status: 500 });
    }
}
