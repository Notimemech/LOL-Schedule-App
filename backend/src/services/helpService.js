import * as helpRepository from '../repositories/helpRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import { chatCompletion, isLlmConfigured } from './llmClient.js';
import { sendSupportTicketEmail } from './emailService.js';
import { HELP_KNOWLEDGE } from '../config/helpKnowledge.js';
import AppError from '../utils/appError.js';

const TICKET_CATEGORIES = ['deposit', 'withdraw', 'bet', 'account', 'other'];
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOOL_ROUNDS = 4;

// ===== Tickets =====

export const createTicket = async (userId, category, subject, message) => {
    if (!userId) throw new AppError('userId is required', 400);
    if (!TICKET_CATEGORIES.includes(category)) {
        throw new AppError('Invalid ticket category', 400);
    }
    if (!subject?.trim() || !message?.trim()) {
        throw new AppError('Subject and message are required', 400);
    }
    const ticket = await helpRepository.createTicket(
        userId,
        category,
        subject.trim().slice(0, 200),
        message.trim().slice(0, 2000)
    );

    // Notify the support inbox. Fire-and-forget: the ticket is saved either way.
    userRepository
        .findUserById(userId)
        .then((user) => sendSupportTicketEmail(ticket, user))
        .catch((error) => console.error('Failed to send ticket notification email:', error));

    return ticket;
};

export const getTicketsByUserId = async (userId) => {
    return await helpRepository.getTicketsByUserId(userId);
};

// ===== AI chat agent =====

const SYSTEM_PROMPT = `You are the in-app Help Center assistant for a mobile eSports betting app.

RULES:
- Only help with questions about using THIS app (wallet, deposits, withdrawals, bets, VIP, follows, account). Politely decline anything else.
- NEVER give betting tips, odds predictions, or financial advice.
- Answer in the same language the user writes in (usually Vietnamese). Be concise and use numbered steps when guiding the user.
- You can read the requesting user's own data with the provided tools. Use them BEFORE answering questions like "why didn't my deposit arrive" — diagnose from real data, then explain the likely cause and next steps. Never invent data.
- You can never see or discuss any other user's data.
- You can only READ data. You cannot refund, modify balances, change bets, or unlock accounts. When the user needs such an intervention, or diagnostics show a real inconsistency, call the open_ticket_form tool with a suggested category and subject — this shows the user a support ticket form.
- Amounts are in VND. Negative transaction amounts mean money out (BET/WITHDRAW), positive mean money in (DEPOSIT/PAYOUT/REFUND).

KNOWLEDGE BASE:
${HELP_KNOWLEDGE}`;

const TOOLS = [
    {
        type: 'function',
        function: {
            name: 'get_wallet_overview',
            description:
                "Read the current user's wallet balance, their 10 most recent wallet transactions, and their 5 most recent VNPay payment attempts. Use for deposit/withdraw/balance questions.",
            parameters: { type: 'object', properties: {}, required: [] },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_recent_bets',
            description:
                "Read the current user's 10 most recent bets with their status, payout, market status/result, and match info. Use for questions about missing bets or missing winnings.",
            parameters: { type: 'object', properties: {}, required: [] },
        },
    },
    {
        type: 'function',
        function: {
            name: 'open_ticket_form',
            description:
                'Show the user a support-ticket form for issues that need human intervention (refunds, data fixes, account issues, or verified inconsistencies). Provide a suggested category and short subject.',
            parameters: {
                type: 'object',
                properties: {
                    category: { type: 'string', enum: TICKET_CATEGORIES },
                    subject: { type: 'string', description: 'Short one-line summary of the issue' },
                },
                required: ['category', 'subject'],
            },
        },
    },
];

const sanitizeMessages = (messages) => {
    if (!Array.isArray(messages)) throw new AppError('messages must be an array', 400);
    return messages
        .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
        .slice(-MAX_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));
};

const runTool = async (name, userId) => {
    if (name === 'get_wallet_overview') return await helpRepository.getWalletOverview(userId);
    if (name === 'get_recent_bets') return await helpRepository.getRecentBets(userId);
    return { error: `Unknown tool: ${name}` };
};

export const chat = async (userId, messages) => {
    if (!userId) throw new AppError('userId is required', 400);

    if (!isLlmConfigured()) {
        // No LLM key configured — degrade gracefully: the user can still file a ticket.
        return {
            reply:
                'Trợ lý AI hiện chưa sẵn sàng. Bạn có thể gửi yêu cầu hỗ trợ trực tiếp cho đội ngũ của chúng tôi bằng form bên dưới.',
            action: 'open_ticket_form',
            ticketDraft: { category: 'other', subject: '' },
        };
    }

    const convo = [{ role: 'system', content: SYSTEM_PROMPT }, ...sanitizeMessages(messages)];

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const message = await chatCompletion({ messages: convo, tools: TOOLS });

        const toolCalls = message.tool_calls || [];
        if (toolCalls.length === 0) {
            return { reply: message.content || '', action: null };
        }

        // The ticket form is a terminal action shown by the client, not a data tool.
        const ticketCall = toolCalls.find((c) => c.function?.name === 'open_ticket_form');
        if (ticketCall) {
            let draft = { category: 'other', subject: '' };
            try {
                const args = JSON.parse(ticketCall.function.arguments || '{}');
                if (TICKET_CATEGORIES.includes(args.category)) draft.category = args.category;
                if (typeof args.subject === 'string') draft.subject = args.subject.slice(0, 200);
            } catch (e) {
                // keep defaults
            }
            return {
                reply:
                    message.content ||
                    'Vấn đề này cần đội ngũ hỗ trợ can thiệp. Bạn vui lòng điền form bên dưới, chúng tôi sẽ xử lý sớm nhất.',
                action: 'open_ticket_form',
                ticketDraft: draft,
            };
        }

        convo.push(message);
        for (const call of toolCalls) {
            const result = await runTool(call.function?.name, userId);
            convo.push({
                role: 'tool',
                tool_call_id: call.id,
                content: JSON.stringify(result),
            });
        }
    }

    // Tool-call loop ran too long — bail out with an escalation path.
    return {
        reply: 'Xin lỗi, mình chưa chẩn đoán được vấn đề này. Bạn có thể gửi yêu cầu hỗ trợ bằng form bên dưới.',
        action: 'open_ticket_form',
        ticketDraft: { category: 'other', subject: '' },
    };
};
