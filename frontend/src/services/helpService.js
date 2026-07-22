import api from './api';

// Help Center endpoints — AI support chat + escalation tickets.

// messages: [{ role: 'user' | 'assistant', content: string }]
// Returns { reply, action: 'open_ticket_form' | null, ticketDraft? }
export const sendHelpChat = async (userId, messages) => {
  const response = await api.post('/help/chat', { userId, messages });
  return response.success && response.data ? response.data : null;
};

export const createSupportTicket = async (userId, { category, subject, message }) => {
  const response = await api.post('/help/tickets', { userId, category, subject, message });
  return response.success ? response.data : null;
};

export const getSupportTickets = async (userId) => {
  const response = await api.get(`/help/tickets/${userId}`);
  return response.success && response.data ? response.data : [];
};
