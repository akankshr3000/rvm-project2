const BREVO_API_KEY = process.env.BREVO_API_KEY;

// type: 'register' | 'reset'
export const sendOTP = async (to, otp, type = "reset") => {
  const isRegister = type === "register";

  const subject = isRegister
    ? "Verify Your RVM Account"
    : "Reset Your RVM PIN";

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;padding:30px">
      <h2 style="color:#00aa55">RVM System</h2>

      <p>
        ${isRegister
      ? "Verify your email using the OTP below."
      : "Use the OTP below to reset your PIN."
    }
      </p>

      <div style="
        font-size:36px;
        font-weight:bold;
        letter-spacing:8px;
        color:#00aa55;
        margin:20px 0;
      ">
        ${otp}
      </div>

      <p>This OTP is valid for 5 minutes.</p>
    </div>
  `;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: {
        name: "RVM System",
        email: "rvm.bitm@gmail.com"
      },
      to: [
        {
          email: to
        }
      ],
      subject,
      htmlContent
    })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Brevo Error:", result);
    throw new Error(result.message || "Email sending failed");
  }

  console.log("✅ OTP sent successfully");
  return true;
}; 