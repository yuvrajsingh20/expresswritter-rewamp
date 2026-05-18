/**
 * ═══════════════════════════════════════════════════════════════════
 *  EXPRESS WRITER — CENTRAL EMAIL SYSTEM
 *  All transactional email templates + single send function.
 *  Uses lib/mail.js (nodemailer) under the hood.
 *  dispatchNotification already works — this wraps it for emails.
 * ═══════════════════════════════════════════════════════════════════
 */

import { sendEmail } from './mail';

// ─── Brand constants ──────────────────────────────────────────────
const BRAND = {
  name:    'Express Writer',
  color:   '#002D5B',
  accent:  '#0067B8',
  light:   '#F0F7FF',
  url:     process.env.NEXTAUTH_URL || 'https://expresswriter.in',
  support: process.env.SMTP_USER    || 'support@expresswriter.in',
};

function safeFormatDate(date) {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return 'N/A';
  }
}

// ─── Layout wrapper ───────────────────────────────────────────────
function layout(content, preheader = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Express Writer</title>
</head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif;">
${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <!-- Header -->
      <tr>
        <td style="background:${BRAND.color};padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:900;letter-spacing:1px;">
            ✍️ EXPRESS WRITER
          </h1>
          <p style="margin:4px 0 0;color:#93C5FD;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
            Academic Excellence Platform
          </p>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:40px;">
          ${content}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#F8FAFC;padding:24px 40px;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;text-align:center;line-height:1.6;">
            You are receiving this email because you have an account on <strong>Express Writer</strong>.<br/>
            Questions? Email us at <a href="mailto:${BRAND.support}" style="color:${BRAND.accent};">${BRAND.support}</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`.trim();
}

// ─── Reusable UI blocks ───────────────────────────────────────────
function heading(text) {
  return `<h2 style="margin:0 0 8px;color:${BRAND.color};font-size:22px;font-weight:800;">${text}</h2>`;
}
function subheading(text) {
  return `<p style="margin:0 0 20px;color:#6B7280;font-size:14px;">${text}</p>`;
}
function body(text) {
  return `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">${text}</p>`;
}
function btn(label, url) {
  return `
  <div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:${BRAND.color};color:#fff;padding:14px 32px;border-radius:10px;font-weight:800;font-size:13px;text-decoration:none;letter-spacing:.5px;">
      ${label}
    </a>
  </div>`;
}
function divider() {
  return `<hr style="border:0;border-top:1px solid #E5E7EB;margin:28px 0;" />`;
}
function badge(label, color = BRAND.accent) {
  return `<span style="display:inline-block;background:${color}18;color:${color};border:1px solid ${color}44;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">${label}</span>`;
}
function infoRow(label, value) {
  return `
  <tr>
    <td style="padding:8px 12px;background:#F9FAFB;border-radius:6px;font-size:12px;color:#6B7280;font-weight:700;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#111827;font-weight:600;vertical-align:top;">${value}</td>
  </tr>`;
}
function infoTable(rows) {
  return `
  <table cellpadding="0" cellspacing="4" style="width:100%;margin:20px 0;">
    ${rows}
  </table>`;
}

// ═══════════════════════════════════════════════════════════════════
//  EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════

// 1. Welcome Email (after registration)
export function welcomeHtml({ name, role = 'student' }) {
  const isWriter = role === 'FREELANCER';
  const dashUrl = `${BRAND.url}/${isWriter ? 'freelancer' : 'student'}`;
  return layout(`
    ${heading(`Welcome to Express Writer, ${name}! 🎉`)}
    ${subheading('Your account has been created successfully.')}
    ${body(`We're thrilled to have you on board. ${
      isWriter
        ? 'Your writer profile has been submitted for review. Once approved by our team, you will be able to start accepting projects.'
        : 'You can now place orders for academic writing, SOPs, LORs, and more — all handled by verified expert writers.'
    }`)}
    ${btn(isWriter ? 'Go to Writer Dashboard' : 'Start Your First Order', dashUrl)}
    ${divider()}
    ${body('<small style="color:#9CA3AF;">If you did not create this account, please ignore this email or contact our support team immediately.</small>')}
  `, `Welcome to Express Writer, ${name}!`);
}

// 2. Payment Confirmation (after successful Razorpay payment)
export function paymentConfirmedHtml({ name, orderId, projectTitle, amount, deadline }) {
  return layout(`
    ${badge('Payment Confirmed', '#059669')}
    <br/><br/>
    ${heading('Your Order is Secured! ✅')}
    ${body(`Hi <strong>${name}</strong>, your payment has been successfully processed. Our team will now assign the best specialist for your project.`)}
    ${infoTable(`
      ${infoRow('Order ID',       `XW-${orderId.slice(-6).toUpperCase()}`)}
      ${infoRow('Project',        projectTitle)}
      ${infoRow('Amount Paid',    `₹${amount}`)}
      ${infoRow('Deadline',       safeFormatDate(deadline))}
      ${infoRow('Status',         'Awaiting Writer Assignment')}
    `)}
    ${btn('Track Your Order', `${BRAND.url}/student/orders/${orderId}`)}
    ${divider()}
    ${body('You will receive another email as soon as a writer is assigned. This usually takes under 2 hours.')}
  `, 'Payment confirmed for your order.');
}

// 3. Writer Assigned — EMAIL TO STUDENT
export function writerAssignedStudentHtml({ studentName, writerName, projectTitle, orderId, deadline }) {
  return layout(`
    ${badge('Writer Assigned', BRAND.accent)}
    <br/><br/>
    ${heading(`Your Writer is Ready! ✍️`)}
    ${body(`Hi <strong>${studentName}</strong>, great news — a specialist has been assigned to your order.`)}
    ${infoTable(`
      ${infoRow('Writer',      writerName)}
      ${infoRow('Project',     projectTitle)}
      ${infoRow('Order ID',    `XW-${orderId.slice(-6).toUpperCase()}`)}
      ${infoRow('Deadline',    safeFormatDate(deadline))}
    `)}
    ${body('You can now chat directly with your writer in the order dashboard. Feel free to share any additional details or files.')}
    ${btn('Open Order Chat', `${BRAND.url}/student/orders/${orderId}`)}
  `, `${writerName} has been assigned to your order.`);
}

// 4. Writer Assigned — EMAIL TO WRITER
export function writerAssignedWriterHtml({ writerName, projectTitle, projectDescription, orderId, deadline, studentName }) {
  return layout(`
    ${badge('New Job Assigned', '#7C3AED')}
    <br/><br/>
    ${heading(`You Have a New Project! 🎯`)}
    ${body(`Hi <strong>${writerName}</strong>, a new project has been assigned to you. Please review the details below and begin work promptly.`)}
    ${infoTable(`
      ${infoRow('Project',     projectTitle)}
      ${infoRow('Order ID',    `XW-${orderId.slice(-6).toUpperCase()}`)}
      ${infoRow('Client',      studentName)}
      ${infoRow('Deadline',    safeFormatDate(deadline))}
    `)}
    ${projectDescription ? `
    <div style="background:#F8FAFC;border-left:4px solid ${BRAND.accent};padding:16px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#374151;font-style:italic;line-height:1.6;">"${projectDescription.slice(0, 400)}${projectDescription.length > 400 ? '…' : ''}"</p>
    </div>` : ''}
    ${body('<strong>SLA Reminder:</strong> Please send your first message to the client within <strong>60 minutes</strong> and begin work within <strong>2 hours</strong> of assignment.')}
    ${btn('Open Project Console', `${BRAND.url}/freelancer/projects/${orderId}`)}
  `, `New project assigned: ${projectTitle}`);
}

// 5. Work In Progress — EMAIL TO STUDENT
export function workStartedHtml({ studentName, writerName, projectTitle, orderId, deadline }) {
  return layout(`
    ${badge('Work Started', '#0891B2')}
    <br/><br/>
    ${heading('Your Writer Has Begun Work 🚀')}
    ${body(`Hi <strong>${studentName}</strong>, your specialist <strong>${writerName}</strong> has officially started working on your project.`)}
    ${infoTable(`
      ${infoRow('Project',  projectTitle)}
      ${infoRow('Writer',   writerName)}
      ${infoRow('Deadline', safeFormatDate(deadline))}
    `)}
    ${body('You can monitor progress and communicate with your writer anytime through the order dashboard.')}
    ${btn('View Order', `${BRAND.url}/student/orders/${orderId}`)}
  `, `${writerName} started working on your order.`);
}

// 6. Draft Ready for Review — EMAIL TO STUDENT
export function draftReadyHtml({ studentName, writerName, projectTitle, orderId }) {
  return layout(`
    ${badge('Draft Ready', '#059669')}
    <br/><br/>
    ${heading('Your Draft is Ready for Review! 📄')}
    ${body(`Hi <strong>${studentName}</strong>, excellent news — <strong>${writerName}</strong> has submitted a draft for your review.`)}
    ${body('Please log in to your dashboard to download and review the files. You can either <strong>approve</strong> the work or request a <strong>revision</strong> if changes are needed.')}
    ${infoTable(`
      ${infoRow('Project',  projectTitle)}
      ${infoRow('Writer',   writerName)}
      ${infoRow('Action Required', 'Review & Approve / Request Revision')}
    `)}
    ${btn('Review Your Draft Now', `${BRAND.url}/student/orders/${orderId}`)}
    ${divider()}
    ${body('<small style="color:#9CA3AF;">If you do not take action within 48 hours, the order will be auto-approved.</small>')}
  `, 'Your draft is ready — action required.');
}

// 7. Revision Requested — EMAIL TO WRITER
export function revisionRequestedHtml({ writerName, studentName, projectTitle, orderId, deadline }) {
  return layout(`
    ${badge('Revision Requested', '#D97706')}
    <br/><br/>
    ${heading('Revision Requested 🔄')}
    ${body(`Hi <strong>${writerName}</strong>, the client <strong>${studentName}</strong> has requested a revision on their order.`)}
    ${body('Please check the chat for specific feedback and submit an updated version as soon as possible.')}
    ${infoTable(`
      ${infoRow('Project',  projectTitle)}
      ${infoRow('Client',   studentName)}
      ${infoRow('Deadline', safeFormatDate(deadline))}
    `)}
    ${body('<strong>SLA:</strong> Please deliver the revised draft within <strong>4 hours</strong> of this request.')}
    ${btn('View Project & Revise', `${BRAND.url}/freelancer/projects/${orderId}`)}
  `, `Revision requested on: ${projectTitle}`);
}

// 8. Order Completed — EMAIL TO STUDENT (ONE email only)
export function orderCompletedHtml({ studentName, writerName, projectTitle, orderId }) {
  return layout(`
    ${badge('Order Completed', '#059669')}
    <br/><br/>
    ${heading('Your Order is Complete! 🎉')}
    ${body(`Hi <strong>${studentName}</strong>, your order has been successfully completed and approved.`)}
    ${body(`Thank you for trusting <strong>Express Writer</strong>. Your project <strong>"${projectTitle}"</strong> has been finalised by <strong>${writerName}</strong>.`)}
    ${infoTable(`
      ${infoRow('Project',    projectTitle)}
      ${infoRow('Writer',     writerName)}
      ${infoRow('Order ID',   `XW-${orderId.slice(-6).toUpperCase()}`)}
      ${infoRow('Status',     '✅ Completed')}
    `)}
    ${body('All final files are available in your order dashboard for download at any time.')}
    ${btn('Download Your Files', `${BRAND.url}/student/orders/${orderId}`)}
    ${divider()}
    <div style="background:${BRAND.light};border-radius:10px;padding:20px;text-align:center;margin-top:4px;">
      <p style="margin:0 0 8px;color:${BRAND.color};font-weight:800;font-size:14px;">⭐ Enjoyed the service?</p>
      <p style="margin:0 0 12px;color:#6B7280;font-size:13px;">Your feedback helps improve our writers and the platform.</p>
      <a href="${BRAND.url}/student/orders/${orderId}" style="color:${BRAND.accent};font-weight:800;font-size:13px;">Leave a Review →</a>
    </div>
  `, `Your order "${projectTitle}" is complete!`);
}

// 9. Writer Account Approved by Admin
export function writerApprovedHtml({ writerName }) {
  return layout(`
    ${badge('Account Approved', '#059669')}
    <br/><br/>
    ${heading('You Are Approved! 🎉')}
    ${body(`Hi <strong>${writerName}</strong>, congratulations! Your writer profile on Express Writer has been reviewed and <strong>approved</strong> by our team.`)}
    ${body('You can now log in to your dashboard and start accepting new projects. Make sure your profile is complete to get matched with the best assignments.')}
    ${btn('Go to My Dashboard', `${BRAND.url}/freelancer`)}
    ${divider()}
    ${body('<small style="color:#9CA3AF;">Please maintain a high performance score to keep your Elite/Expert badge and get priority assignments.</small>')}
  `, 'Your writer account has been approved!');
}

// 10. Payout Request Submitted — confirmation to writer
export function payoutRequestedHtml({ writerName, amount, method }) {
  return layout(`
    ${badge('Payout Requested', BRAND.accent)}
    <br/><br/>
    ${heading('Payout Request Received 💰')}
    ${body(`Hi <strong>${writerName}</strong>, we have received your payout request and it is now under review by our finance team.`)}
    ${infoTable(`
      ${infoRow('Amount Requested', `₹${amount}`)}
      ${infoRow('Payment Method',   method || 'Not specified')}
      ${infoRow('Status',           'Under Review')}
    `)}
    ${body('You will receive another email once the payout has been processed (typically within 2–3 business days).')}
    ${btn('View Earnings Dashboard', `${BRAND.url}/freelancer/earnings`)}
  `, `Payout request for ₹${amount} submitted.`);
}

// 11. Payout Processed — writer gets paid
export function payoutProcessedHtml({ writerName, amount, status }) {
  const approved = status === 'COMPLETED';
  return layout(`
    ${badge(approved ? 'Payout Processed' : 'Payout Update', approved ? '#059669' : '#D97706')}
    <br/><br/>
    ${heading(approved ? `Your Payout Has Been Sent! 💸` : `Payout Status Update`)}
    ${body(`Hi <strong>${writerName}</strong>, ${
      approved
        ? `your payout of <strong>₹${amount}</strong> has been processed and should reflect in your account within 24 hours.`
        : `your payout request of <strong>₹${amount}</strong> has been updated to: <strong>${status}</strong>.`
    }`)}
    ${approved ? btn('View Earnings', `${BRAND.url}/freelancer/earnings`) : ''}
    ${divider()}
    ${body('If you have any questions, please contact our support team.')}
  `, `Payout update: ₹${amount}`);
}

// 12. New Support Ticket (to Admin)
export function newTicketAdminHtml({ subject, priority, submittedBy, ticketType }) {
  const priorityColor = priority === 'High' ? '#DC2626' : priority === 'Medium' ? '#D97706' : '#6B7280';
  return layout(`
    ${badge('New Ticket', '#7C3AED')}
    <br/><br/>
    ${heading('New Support Ticket Submitted 🎫')}
    ${body('A new support ticket has been submitted on the platform and requires your attention.')}
    ${infoTable(`
      ${infoRow('Subject',       subject)}
      ${infoRow('Type',          ticketType || 'General')}
      ${infoRow('Priority',      `<span style="color:${priorityColor};font-weight:800;">${priority}</span>`)}
      ${infoRow('Submitted By',  submittedBy)}
    `)}
    ${btn('View Ticket in Admin Panel', `${BRAND.url}/admin/tickets`)}
  `, `New ${priority} priority ticket: ${subject}`);
}

// 13. Refund Status Update (to student)
export function refundStatusHtml({ name, status, amount, orderId }) {
  const approved = status === 'APPROVED';
  const rejected = status === 'REJECTED';
  return layout(`
    ${badge(`Refund ${status}`, approved ? '#059669' : rejected ? '#DC2626' : '#D97706')}
    <br/><br/>
    ${heading(`Refund Request ${status} ${approved ? '✅' : rejected ? '❌' : '⏳'}`)}
    ${body(`Hi <strong>${name}</strong>, your refund request for order <strong>XW-${orderId.slice(-6).toUpperCase()}</strong> has been <strong>${status.toLowerCase()}</strong>.`)}
    ${approved
      ? body(`Your refund of <strong>₹${amount}</strong> will be credited to your original payment method within <strong>5–7 business days</strong>.`)
      : rejected
      ? body('If you believe this decision is incorrect, please contact our support team with your order details.')
      : body('Our team is reviewing your request and will update you shortly.')
    }
    ${btn('View Order', `${BRAND.url}/student/orders/${orderId}`)}
  `, `Refund ${status} for order XW-${orderId.slice(-6).toUpperCase()}`);
}

// 14. Password Reset OTP (replaces existing one)
export function passwordResetHtml({ name, otp }) {
  return layout(`
    ${heading('Reset Your Password 🔐')}
    ${body(`Hi <strong>${name}</strong>, you requested to reset your password. Use the following code:`)}
    <div style="text-align:center;margin:32px 0;padding:24px;background:#F0F7FF;border-radius:12px;border:2px dashed ${BRAND.accent};">
      <p style="margin:0 0 4px;font-size:12px;color:#6B7280;letter-spacing:2px;text-transform:uppercase;">Your OTP Code</p>
      <p style="margin:0;font-size:38px;font-weight:900;letter-spacing:8px;color:${BRAND.color};">${otp}</p>
      <p style="margin:8px 0 0;font-size:11px;color:#9CA3AF;">Expires in 10 minutes</p>
    </div>
    ${body("If you didn't request this, you can safely ignore this email.")}
  `, 'Your password reset code.');
}

// ═══════════════════════════════════════════════════════════════════
//  SAFE SEND HELPER — non-blocking, logs errors without crashing
// ═══════════════════════════════════════════════════════════════════
export async function safeSendEmail({ to, subject, html }) {
  if (!to) return;
  try {
    await sendEmail({ to, subject, html });
    console.log(`✅ Email sent → ${to} [${subject}]`);
  } catch (err) {
    console.error(`❌ Email failed → ${to} [${subject}]:`, err.message);
    // Non-blocking: never throw
  }
}
