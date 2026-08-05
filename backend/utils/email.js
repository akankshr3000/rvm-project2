import nodemailer from 'nodemailer';

// type: 'register' | 'reset'
export const sendOTP = async (to, otp, type = 'reset') => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables are missing.');
  }

  // SMTP Transport (Port 587 + TLS)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true only for 465
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify SMTP connection
  try {
    await transporter.verify();
    console.log('✅ SMTP Server Connected Successfully');
  } catch (err) {
    console.error('❌ SMTP Verification Failed:', err);
    throw new Error('SMTP connection failed');
  }

  const isRegister = type === 'register';

  const subject = isRegister
    ? 'Verify Your RVM Account'
    : 'Reset Your RVM PIN';

  const heading = isRegister
    ? 'Email Verification'
    : 'Password Reset Request';

  const bodyText = isRegister
    ? 'You are registering a new account on the RVM System. Please use the code below to verify your email address:'
    : 'You have requested to reset your 4-digit PIN for the RVM System. Your secure verification code is:';

  const footerNote = isRegister
    ? 'This code will expire in <strong>5 minutes</strong>. If you did not attempt to register, please ignore this email.'
    : 'This code will expire in <strong>5 minutes</strong>. If you did not request this reset, please ignore this email to keep your account secure.';

  const mailOptions = {
    from: `"RVM System" <${emailUser}>`,
    to,
    subject,
    html: `
      <div style="font-family: 'Space Grotesk', 'Inter', Arial, sans-serif; padding: 30px; color: #e8f5e8; background-color: #050805; max-width: 600px; margin: 0 auto; border: 1px solid rgba(0,255,136,0.2); border-radius: 12px; box-shadow: 0 0 20px rgba(0,255,136,0.05);">
        <h2 style="color: #00ff88; margin-top: 0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(0,255,136,0.2); padding-bottom: 15px;">
          ${heading}
        </h2>

        <p style="color: rgba(232,245,232,0.8); line-height: 1.6;">
          ${bodyText}
        </p>

        <div style="background: rgba(0,255,136,0.05); border: 1px solid #00ff88; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0; box-shadow: 0 0 15px rgba(0,255,136,0.1) inset;">
          <span style="font-size: 36px; font-weight: 800; color: #00ff88; letter-spacing: 0.25em;">
            ${otp}
          </span>
        </div>

        <p style="color: rgba(232,245,232,0.6); font-size: 14px; margin-bottom: 30px;">
          ${footerNote}
        </p>

        <p style="color: rgba(232,245,232,0.4); font-size: 12px; margin: 0; border-top: 1px solid rgba(232,245,232,0.1); padding-top: 15px;">
          Best regards,<br/>
          RVM System Security Team
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log(
      `✅ ${isRegister ? 'Registration' : 'Password Reset'} OTP sent to ${to}`
    );
    console.log('Message ID:', info.messageId);

    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP to ${to}`);
    console.error(error);

    throw new Error('Failed to dispatch email securely via SMTP');
  }
}; 