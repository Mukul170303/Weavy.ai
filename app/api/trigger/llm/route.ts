import { NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

const llmSchema = z.object({
    prompt: z.string().min(1),
    systemPrompt: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
    model: z.string().optional().default("gemini-2.5-flash"),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    userId: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Validate with Zod
        const result = llmSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ 
                error: 'Invalid request data', 
                details: result.error.flatten() 
            }, { status: 400 });
        }

        const data = result.data;

        const handle = await tasks.trigger("generate-text", {
            prompt: data.prompt,
            systemPrompt: data.systemPrompt,
            imageUrls: data.imageUrls,
            model: data.model,
            temperature: data.temperature
        });

        return NextResponse.json({ runId: handle.id });
    } catch (error: any) {
        console.error('Error triggering LLM task:', error);
        return NextResponse.json({ error: error.message || 'Failed to trigger task' }, { status: 500 });
    }
}
