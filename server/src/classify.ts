import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const Result = z.object({
  category: z.enum(['glasses', 'earrings', 'necklace', 'other']),
  confidence: z.number().min(0).max(1),
});
export type ClassifyResult = z.infer<typeof Result>;

const PROMPT =
  'Classify the product in this image into exactly one category: ' +
  'glasses (eyeglasses or sunglasses), earrings, necklace, or other. ' +
  'Reply only with JSON like {"category":"glasses","confidence":0.93}.';

const FALLBACK: ClassifyResult = { category: 'other', confidence: 0 };

/**
 * الـ AI agent: بيبعت صورة المنتج لـ Gemini ويرجّع النوع.
 * أي مشكلة (مفيش مفتاح، حد الاستخدام المجاني، خطأ شبكة) بترجّع "other"
 * والفرونت وقتها بيخلي المستخدم يختار النوع بنفسه، فالـ AI تحسين مش شرط.
 */
export async function classifyProduct(filePath: string, mimeType: string): Promise<ClassifyResult> {
  if (!ai) return FALLBACK;
  try {
    const data = (await fs.promises.readFile(filePath)).toString('base64');
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data } }, { text: PROMPT }] }],
      config: { responseMimeType: 'application/json', temperature: 0 },
    });
    const text = (res.text ?? '').replace(/^```(?:json)?\s*|\s*```$/g, '');
    const parsed = Result.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : FALLBACK;
  } catch (e) {
    console.warn('[classify] failed:', e instanceof Error ? e.message : e);
    return FALLBACK;
  }
}
