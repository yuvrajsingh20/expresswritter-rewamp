const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' }); // Load from root .env if running inside scratch or absolute path

// Since we are running this script directly, let's load variables
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'admin@xpresswriters.in',
    pass: 'odeprdvqlvleyows'
  }
};

console.log('Testing SMTP connection with config:', {
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  user: smtpConfig.auth.user
});

const transporter = nodemailer.createTransport(smtpConfig);

async function run() {
  try {
    // 1. Verify connection configuration
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');

    // 2. Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: '"Express Writer Test" <Admin@xpresswriters.in>',
      to: '13yuvrajsingh2004@gmail.com', // Let's send a test to the user's Gmail we saw earlier
      subject: 'Express Writer SMTP Test',
      text: 'If you are reading this, SMTP configuration is working perfectly!',
      html: '<b>If you are reading this, SMTP configuration is working perfectly!</b>'
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error encountered:');
    console.error(error);
  }
}

run();
