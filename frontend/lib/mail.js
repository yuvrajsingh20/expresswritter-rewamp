import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Generic Mailer (Used by smart dispatcher)
 */
export async function sendEmail({ to, subject, html }) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📧 [Dev Mode] Sending Email to ${to}...`);
  }
  
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
}

/**
 * Sends a professional verification email
 */
export async function sendVerificationEmail(to, name, token) {
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0a192f; text-align: center;">Welcome to Express Writer</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining our elite writing platform. Please click the button below to verify your email address and activate your account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #0a192f; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p style="font-size: 0.8em; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 0.8em; color: #aaa; text-align: center;">Powered by Admivo.in</p>
    </div>
  `;

  return sendEmail({ to, subject: 'Complete your registration - Express Writer', html });
}

/**
 * Sends notification for project updates
 */
export async function sendProjectNotification(to, projectName, status) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h3 style="color: #0a192f;">Project Update: ${projectName}</h3>
      <p>The status of your project has been updated to: <strong>${status}</strong></p>
      <p>Log in to your dashboard to view more details.</p>
    </div>
  `;

  return sendEmail({ to, subject: `Update on your project: ${projectName}`, html });
}
