import { Resend } from 'resend';

// Initialize Resend client lazily to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'AfterMe <noreply@afterme.app>';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResendClient();

    if (!client) {
      console.warn('[Email] RESEND_API_KEY not configured, skipping email send');
      console.log('[Email] Would have sent:', options.subject, 'to:', options.to);
      return { success: true }; // Don't fail in development
    }

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[Email] Failed to send:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email template functions
export async function sendTrusteeVerificationEmail(params: {
  trusteeEmail: string;
  trusteeName: string;
  userName: string;
  verificationLink: string;
}) {
  const { trusteeEmail, trusteeName, userName, verificationLink } = params;

  return sendEmail({
    to: trusteeEmail,
    subject: `${userName} has added you as a Trustee on AfterMe`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <div style="background: linear-gradient(135deg, #7c9a7c 0%, #5a7d5a 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">AfterMe</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Preserving memories for generations</p>
        </div>

        <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="margin: 0 0 16px 0; color: #2d3748; font-size: 22px;">Hello ${trusteeName},</h2>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            <strong style="color: #5a7d5a;">${userName}</strong> has added you as a trusted person (Trustee) on AfterMe.
          </p>

          <div style="background: #f7fafc; border-left: 4px solid #7c9a7c; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #4a5568; font-size: 14px;">
              <strong>What does this mean?</strong><br><br>
              As a Trustee, you may be contacted in the future to help verify a legacy access request.
              This is an important role in ensuring ${userName}'s wishes are honored.
            </p>
          </div>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Please click the button below to verify your email and accept this role:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #7c9a7c 0%, #5a7d5a 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Verify & Accept
            </a>
          </div>

          <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
            If you did not expect this email or have concerns, you can safely ignore it.
          </p>
        </div>

        <div style="text-align: center; padding: 24px; color: #a0aec0; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} AfterMe. All rights reserved.</p>
          <p style="margin: 8px 0 0 0;">Preserving what matters most.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hello ${trusteeName},\n\n${userName} has added you as a Trustee on AfterMe.\n\nAs a Trustee, you may be contacted in the future to help verify a legacy access request.\n\nPlease visit this link to verify your email: ${verificationLink}\n\nIf you did not expect this email, you can safely ignore it.\n\n- AfterMe Team`,
  });
}

export async function sendLegacyAccessRequestEmail(params: {
  trusteeEmail: string;
  trusteeName: string;
  userName: string;
  requesterName: string;
  requesterEmail: string;
  confirmationLink: string;
}) {
  const { trusteeEmail, trusteeName, userName, requesterName, requesterEmail, confirmationLink } = params;

  return sendEmail({
    to: trusteeEmail,
    subject: `[Action Required] Legacy Access Request for ${userName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <div style="background: linear-gradient(135deg, #c97878 0%, #b85c5c 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">AfterMe</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Legacy Access Request</p>
        </div>

        <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #c53030; font-size: 14px; font-weight: 600;">
              ⚠️ Important: Your verification is needed
            </p>
          </div>

          <h2 style="margin: 0 0 16px 0; color: #2d3748; font-size: 22px;">Hello ${trusteeName},</h2>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Someone has requested legacy access to <strong style="color: #5a7d5a;">${userName}'s</strong> AfterMe account.
          </p>

          <div style="background: #f7fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 12px 0; color: #2d3748; font-size: 14px;"><strong>Requester Details:</strong></p>
            <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px;">Name: <strong>${requesterName}</strong></p>
            <p style="margin: 0; color: #4a5568; font-size: 14px;">Email: <strong>${requesterEmail}</strong></p>
          </div>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            As a designated Trustee, your confirmation is required to verify this request. Please only confirm if you know that ${userName} has passed away.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${confirmationLink}" style="display: inline-block; background: linear-gradient(135deg, #7c9a7c 0%, #5a7d5a 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Review & Respond
            </a>
          </div>

          <div style="background: #fffaf0; border-left: 4px solid #ed8936; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #744210; font-size: 14px;">
              <strong>Note:</strong> If you believe this is a false request and ${userName} is still alive,
              please deny the request. They will be notified immediately.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 24px; color: #a0aec0; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} AfterMe. All rights reserved.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hello ${trusteeName},\n\nSomeone has requested legacy access to ${userName}'s AfterMe account.\n\nRequester: ${requesterName} (${requesterEmail})\n\nAs a designated Trustee, please visit this link to confirm or deny the request:\n${confirmationLink}\n\nOnly confirm if you know that ${userName} has passed away.\n\n- AfterMe Team`,
  });
}

export async function sendGracePeriodNotificationEmail(params: {
  requesterEmail: string;
  requesterName: string;
  userName: string;
  gracePeriodEnds: Date;
  accessLink: string;
}) {
  const { requesterEmail, requesterName, userName, gracePeriodEnds, accessLink } = params;
  const formattedDate = gracePeriodEnds.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return sendEmail({
    to: requesterEmail,
    subject: `Legacy Access Approved - 7-Day Grace Period Started`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <div style="background: linear-gradient(135deg, #7c9a7c 0%, #5a7d5a 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">AfterMe</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Legacy Access Update</p>
        </div>

        <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #276749; font-size: 14px; font-weight: 600;">
              ✓ Trustee Verification Complete
            </p>
          </div>

          <h2 style="margin: 0 0 16px 0; color: #2d3748; font-size: 22px;">Hello ${requesterName},</h2>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            The trustees have verified your legacy access request for <strong style="color: #5a7d5a;">${userName}'s</strong> account.
          </p>

          <div style="background: linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #2d3748; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Grace Period Ends</p>
            <p style="margin: 0; color: #2b6cb0; font-size: 20px; font-weight: 600;">${formattedDate}</p>
          </div>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            A 7-day grace period has started. This period allows the account holder to deny access if this request was made in error.
          </p>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            After the grace period ends, you will receive another email with full access to ${userName}'s legacy content.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${accessLink}" style="display: inline-block; background: linear-gradient(135deg, #7c9a7c 0%, #5a7d5a 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Request Status
            </a>
          </div>
        </div>

        <div style="text-align: center; padding: 24px; color: #a0aec0; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} AfterMe. All rights reserved.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hello ${requesterName},\n\nThe trustees have verified your legacy access request for ${userName}'s account.\n\nA 7-day grace period has started and will end on ${formattedDate}.\n\nAfter the grace period, you will receive full access to ${userName}'s legacy content.\n\nView status: ${accessLink}\n\n- AfterMe Team`,
  });
}

export async function sendFalseAlarmNotificationEmail(params: {
  userEmail: string;
  userName: string;
  requesterName: string;
  requesterEmail: string;
}) {
  const { userEmail, userName, requesterName, requesterEmail } = params;

  return sendEmail({
    to: userEmail,
    subject: `[Alert] Someone Requested Legacy Access to Your Account`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">AfterMe</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Security Alert</p>
        </div>

        <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: #fffaf0; border: 1px solid #fbd38d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #c05621; font-size: 14px; font-weight: 600;">
              ⚠️ Legacy Access Request Denied
            </p>
          </div>

          <h2 style="margin: 0 0 16px 0; color: #2d3748; font-size: 22px;">Hello ${userName},</h2>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            We're writing to inform you that someone attempted to access your legacy content, but the request was <strong style="color: #c05621;">denied by your trustees</strong>.
          </p>

          <div style="background: #f7fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 12px 0; color: #2d3748; font-size: 14px;"><strong>Request Details:</strong></p>
            <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px;">Requester: <strong>${requesterName}</strong></p>
            <p style="margin: 0; color: #4a5568; font-size: 14px;">Email: <strong>${requesterEmail}</strong></p>
          </div>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Your trustees have confirmed that this was a false request, and no access has been granted. Your account and content remain secure.
          </p>

          <div style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #276749; font-size: 14px;">
              <strong>No action required.</strong> This is just a notification for your awareness.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 24px; color: #a0aec0; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} AfterMe. All rights reserved.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hello ${userName},\n\nSomeone attempted to access your legacy content, but the request was denied by your trustees.\n\nRequester: ${requesterName} (${requesterEmail})\n\nYour account and content remain secure. No action is required.\n\n- AfterMe Team`,
  });
}

export async function sendAccessGrantedEmail(params: {
  requesterEmail: string;
  requesterName: string;
  userName: string;
  accessLink: string;
  accessToken: string;
}) {
  const { requesterEmail, requesterName, userName, accessLink, accessToken } = params;

  return sendEmail({
    to: requesterEmail,
    subject: `Legacy Access Granted - ${userName}'s Memories Await`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <div style="background: linear-gradient(135deg, #7c9a7c 0%, #5a7d5a 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">AfterMe</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Legacy Access Granted</p>
        </div>

        <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #276749; font-size: 14px; font-weight: 600;">
              ✓ Access Granted Successfully
            </p>
          </div>

          <h2 style="margin: 0 0 16px 0; color: #2d3748; font-size: 22px;">Hello ${requesterName},</h2>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            You now have access to <strong style="color: #5a7d5a;">${userName}'s</strong> legacy content on AfterMe.
          </p>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            ${userName} prepared these memories, messages, and documents for you. We hope they bring you comfort and help preserve their legacy.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${accessLink}" style="display: inline-block; background: linear-gradient(135deg, #7c9a7c 0%, #5a7d5a 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
              View ${userName}'s Legacy
            </a>
          </div>

          <div style="background: #f7fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Access Token</p>
            <p style="margin: 0; color: #2d3748; font-size: 14px; font-family: monospace; word-break: break-all; background: #edf2f7; padding: 12px; border-radius: 4px;">${accessToken}</p>
            <p style="margin: 12px 0 0 0; color: #718096; font-size: 12px;">Keep this token safe. You may need it to access the content in the future.</p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 24px;">
            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
              "Those we love don't go away, they walk beside us every day. Unseen, unheard, but always near, still loved, still missed, and very dear."
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 24px; color: #a0aec0; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} AfterMe. All rights reserved.</p>
          <p style="margin: 8px 0 0 0;">Preserving what matters most.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hello ${requesterName},\n\nYou now have access to ${userName}'s legacy content on AfterMe.\n\n${userName} prepared these memories, messages, and documents for you.\n\nAccess the legacy: ${accessLink}\n\nYour Access Token: ${accessToken}\n\nKeep this token safe for future access.\n\n- AfterMe Team`,
  });
}

export async function sendTrustedCircleInviteEmail(params: {
  inviteeEmail: string;
  inviteeName: string;
  inviterName: string;
  inviteLink: string;
  message?: string;
}) {
  const { inviteeEmail, inviteeName, inviterName, inviteLink, message } = params;

  return sendEmail({
    to: inviteeEmail,
    subject: `${inviterName} invited you to their Trusted Circle on AfterMe`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <div style="background: linear-gradient(135deg, #7c9a7c 0%, #5a7d5a 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">AfterMe</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Trusted Circle Invitation</p>
        </div>

        <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="margin: 0 0 16px 0; color: #2d3748; font-size: 22px;">Hello${inviteeName ? ` ${inviteeName}` : ''},</h2>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            <strong style="color: #5a7d5a;">${inviterName}</strong> has invited you to join their Trusted Circle on AfterMe.
          </p>

          ${message ? `
          <div style="background: #f7fafc; border-left: 4px solid #7c9a7c; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px; text-transform: uppercase;">Personal Message:</p>
            <p style="margin: 0; color: #4a5568; font-size: 14px; font-style: italic;">"${message}"</p>
          </div>
          ` : ''}

          <div style="background: linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
            <p style="margin: 0 0 12px 0; color: #2d3748; font-size: 14px;"><strong>What is a Trusted Circle?</strong></p>
            <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
              Being part of someone's Trusted Circle means you can share important documents,
              memories, and legacy information with each other securely.
            </p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #7c9a7c 0%, #5a7d5a 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Accept Invitation
            </a>
          </div>

          <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
            If you don't have an AfterMe account, you'll be able to create one when you accept.
          </p>
        </div>

        <div style="text-align: center; padding: 24px; color: #a0aec0; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} AfterMe. All rights reserved.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hello${inviteeName ? ` ${inviteeName}` : ''},\n\n${inviterName} has invited you to join their Trusted Circle on AfterMe.\n\n${message ? `Message: "${message}"\n\n` : ''}Accept the invitation: ${inviteLink}\n\nIf you don't have an account, you can create one when you accept.\n\n- AfterMe Team`,
  });
}
