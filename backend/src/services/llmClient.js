import AppError from '../utils/appError.js';

// Thin OpenAI-compatible chat-completions client. Works with any provider
// exposing the /chat/completions contract (OpenAI, Gemini's OpenAI endpoint,
// Groq, DeepSeek, Ollama, ...). Configure via .env:
//   LLM_BASE_URL  e.g. https://api.openai.com/v1
//   LLM_API_KEY   provider key
//   LLM_MODEL     model id, e.g. gpt-4o-mini
const getConfig = () => ({
    baseUrl: (process.env.LLM_BASE_URL || '').replace(/\/+$/, ''),
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || '',
});

export const isLlmConfigured = () => {
    const { baseUrl, apiKey, model } = getConfig();
    return Boolean(baseUrl && apiKey && model);
};

export const chatCompletion = async ({ messages, tools, temperature = 0.3 }) => {
    const { baseUrl, apiKey, model } = getConfig();

    const body = { model, messages, temperature };
    if (tools && tools.length > 0) body.tools = tools;

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        console.error('LLM request failed:', response.status, detail.slice(0, 500));
        throw new AppError('AI service is temporarily unavailable', 502);
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message;
    if (!message) {
        throw new AppError('AI service returned an unexpected response', 502);
    }
    return message;
};
