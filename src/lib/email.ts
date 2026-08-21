import nodemailer from 'nodemailer';

export async function sendSchoolOnboardingEmail({
  email,
  schoolName,
  activationUrl,
  recipientName = 'School Administrator',
}: {
  email: string;
  schoolName: string;
  activationUrl: string;
  recipientName?: string;
}) {
  console.log(`\n================================================================`);
  console.log(`✉️ [ONBOARDING EMAIL] Dispatching direct invite link to: ${email}`);
  console.log(`🏫 School: ${schoolName}`);
  console.log(`🔗 Direct 1-Click Link: ${activationUrl}`);
  console.log(`================================================================\n`);

  // 1. SMTP Dispatch (if SMTP or Gmail is configured)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: `"SchoolPapers AI" <${smtpUser}>`,
        to: email,
        subject: `Welcome to SchoolPapers AI — Activate ${schoolName}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">SchoolPapers AI</h1>
              <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 13px;">School Workspace Activation</p>
            </div>
            <div style="padding: 36px 32px;">
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px 0;">Welcome, ${recipientName}!</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Your institution <strong>${schoolName}</strong> has been onboarded to SchoolPapers AI.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${activationUrl}" style="background: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block;">
                  Click Here to Set Password &rarr;
                </a>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-top: 20px;">
                <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0;">Direct link:</p>
                <a href="${activationUrl}" style="color: #4f46e5; font-size: 11px; word-break: break-all;">${activationUrl}</a>
              </div>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0;">
                This activation link is valid for 7 days.
              </p>
            </div>
          </div>
        `,
      });

      console.log(`[SMTP Dispatch Success] Message ID: ${info.messageId}`);
      return { success: true, method: 'smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.error('[SMTP Error]', smtpErr);
    }
  }

  // 2. GoodSender Email Template Dispatch (Strictly keeping anti_phishing_notice under 150 chars)
  const apiKey = process.env.GOODSENDER_API_KEY || 'gs_bXPzl00wUssoAT3oVpqE9j7R3u9Pi1XV';
  const senderEmail = process.env.GOODSENDER_SENDER_EMAIL || 'support@qalam.website';

  try {
    const goodsenderUrl = 'https://api.goodsender.com/v1/emails/template';
    const emailPayload = {
      from: { email: senderEmail, name: 'SchoolPapers AI' },
      to: { email },
      subject: `Activate ${schoolName} — Set Your Password`,
      template: {
        template_id: 'otp_code',
        variables: {
          purpose: `Password setup for ${schoolName}`,
          app_name: 'SchoolPapers AI',
          otp_code: 'ACTIVATE',
          expiry_minutes: '10080',
          anti_phishing_notice: `Activation Link: ${activationUrl}`,
        },
      },
    };

    const response = await fetch(goodsenderUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json().catch(() => null);
    console.log(`[GoodSender Result] Status: ${response.status}`, result);

    return { success: response.ok, method: 'goodsender', result };
  } catch (error) {
    console.error('[Email Dispatch Error]', error);
    return { success: false, error };
  }
}
