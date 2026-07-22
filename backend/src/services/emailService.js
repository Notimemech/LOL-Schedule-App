import nodemailer from 'nodemailer';

// Outbound email for Help Center tickets. Configure via .env:
//   SMTP_HOST      default smtp.gmail.com
//   SMTP_PORT      default 465 (SSL)
//   SMTP_USER      the Gmail address used to send
//   SMTP_PASS      a Gmail App Password (NOT the account password)
//   SUPPORT_EMAIL  where ticket notifications are delivered
const isEmailConfigured = () =>
    Boolean(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SUPPORT_EMAIL);

const getTransporter = () => {
    const port = Number(process.env.SMTP_PORT) || 465;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Fire-and-forget from the caller's perspective: the ticket is already saved
// in the DB, so a mail failure must never fail the API request.
export const sendSupportTicketEmail = async (ticket, user) => {
    if (!isEmailConfigured()) {
        console.log('[email] SMTP not configured — skipping ticket notification email');
        return false;
    }

    const lines = [
        `New support ticket #${ticket.id}`,
        ``,
        `Category : ${ticket.category}`,
        `Subject  : ${ticket.subject}`,
        `Status   : ${ticket.status}`,
        `Created  : ${ticket.created_at}`,
        ``,
        `From user`,
        `  id       : ${user?.id ?? ticket.user_id}`,
        `  username : ${user?.username ?? 'unknown'}`,
        `  email    : ${user?.email ?? 'unknown'}`,
        `  phone    : ${user?.phone ?? 'unknown'}`,
        ``,
        `Message`,
        `${ticket.message}`,
    ];

    await getTransporter().sendMail({
        from: `"LOL Schedule Support" <${process.env.SMTP_USER}>`,
        to: process.env.SUPPORT_EMAIL,
        subject: `[Support #${ticket.id}] [${ticket.category.toUpperCase()}] ${ticket.subject}`,
        text: lines.join('\n'),
    });
    console.log(`[email] Ticket #${ticket.id} notification sent to ${process.env.SUPPORT_EMAIL}`);
    return true;
};
