import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// type: 'register' | 'reset'
export const sendOTP = async (to, otp, type = "reset") => {
  const isRegister = type === "register";

  const subject = isRegister
    ? "Verify Your RVM Account"
    : "Reset Your RVM PIN";

  const heading = isRegister
    ? "Email Verification"
    : "Password Reset Request";

  const bodyText = isRegister
    ? "You are registering a new account on the RVM System. Please use the OTP below to verify your email address."
    : "You requested to reset your 4-digit PIN. Use the OTP below to continue.";

  const footerNote = isRegister
    ? "This OTP expires in 5 minutes. If you didn't create this account, ignore this email."
    : "This OTP expires in 5 minutes. If you didn't request this reset, ignore this email.";

  try {
    const { data, error } = await resend.emails.send({
      from: "RVM System <onboarding@resend.dev>",
      to: [to],
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;padding:30px;background:#050805;color:#fff;">
          <h2 style="color:#00ff88">${heading}</h2>

          <p>${bodyText}</p>

          <div style="
            margin:30px 0;
            padding:20px;
            border:2px solid #00ff88;
            text-align:center;
            font-size:36px;
            font-weight:bold;
            color:#00ff88;
            letter-spacing:8px;
          ">
            ${otp}
          </div>

          <p>${footerNote}</p>

          <hr>

          <p>RVM System Security Team</p>
        </div>
      `,
    });

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }

    console.log("✅ OTP Email Sent");
    console.log(data);

    return true;
  } catch (err) {
    console.error("❌ Resend Error:", err);
    throw new Error("Failed to send OTP");
  }
}; 