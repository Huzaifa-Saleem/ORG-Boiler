import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationEmailParams {
  to: string;
  inviterName: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
}

interface EmailResult {
  success: boolean;
  data: any | null;
  error: { message: string } | null;
}

export async function sendInvitationEmail({
  to,
  inviterName,
  organizationName,
  role,
  inviteUrl,
}: SendInvitationEmailParams): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: `${organizationName} <noreply@${process.env.RESEND_DOMAIN || 'example.com'}>`,
      to,
      subject: `You've been invited to join ${organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
            <h1 style="color: #333;">${organizationName}</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2>You've been invited!</h2>
            <p>${inviterName} has invited you to join ${organizationName} as a ${role.toLowerCase()}.</p>
            <p>Click the button below to accept the invitation and create your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Accept Invitation
              </a>
            </div>
            <p>This invitation will expire in 7 days.</p>
            <p>If you don't want to join or believe this was sent in error, you can safely ignore this email.</p>
          </div>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send invitation email:', error);
      return { success: false, error, data: null };
    }

    return { success: true, data, error: null };
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: { message: error.message }, data: null };
  }
}
