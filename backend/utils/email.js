import * as Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const sendOTP = async (to, otp, type = "reset") => {
  const isRegister = type === "register";

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = isRegister
    ? "Verify Your RVM Account"
    : "Reset Your RVM PIN";

  sendSmtpEmail.htmlContent = `
    <h2>RVM Verification</h2>
    <p>Your OTP is:</p>
    <h1>${otp}</h1>
    <p>Valid for 5 minutes.</p>
  `;

  sendSmtpEmail.sender = {
    name: "RVM System",
    email: "rvm.bitm@gmail.com",
  };

  sendSmtpEmail.to = [{ email: to }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("OTP Sent");
    return true;
  } catch (err) {
    console.error(err.response?.body || err);
    throw new Error("Failed to send OTP");
  }
}; 