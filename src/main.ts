import express, { type Request, type Response } from 'express';
import { z } from 'zod';

const TIMEOUT_MS = 60_000;
const PORT = 8000;
const OLL_HOST = 'http://localhost:11434';
const headers = { 'Content-Type': 'application/json' };

const QuerySchema = z.object({
    prompt: z.string().min(1).max(8000),
    model: z.string().regex(/^[\w.:\-/]*$/, 'Invalid model name').default('llama3.2'),
});

interface OllResp { 
    response?: string; 
};

const app = express();
app.use(express.json({ limit: '100kb' }));
app.post('/chat', async (req: Request, res: Response) => {
    const parsed = QuerySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            status: 'error',
            detail: parsed.error.flatten().fieldErrors,
        });
    }
    const { prompt, model } = parsed.data;

    try {
        const upstream = await fetch(`${OLL_HOST}/api/generate`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ model, prompt, stream: false }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!upstream.ok) {
            const detail = await upstream.text();
            return res.status(502).json({
                status: 'error',
                detail: `Ollama returned ${upstream.status}: ${detail}`,
            });
        }

        const data = (await upstream.json()) as OllResp;

        return res.json({
            status: 'succes',
            model: model,
            reply: data.response,
        });
    } catch (err) {
        const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
        return res.status(isTimeout ? 504 : 502).json({
            status: 'error',
            detail: isTimeout ? 'Ollama request timed out' : `Ollama connection error ${err instanceof Error ? err.message : String(err)}` 
        })
    }
});

app.listen(PORT, () => {
    console.log(`ollama gateway listening on :${PORT}, upstream ${OLL_HOST}`);
});
