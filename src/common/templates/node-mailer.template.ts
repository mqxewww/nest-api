export enum NodeMailerTemplate {
  RESET_PASSWORD_REQUEST = "RESET_PASSWORD_REQUEST"
}

export const NodeMailerSubject = {
  [NodeMailerTemplate.RESET_PASSWORD_REQUEST]: "Password change request."
};

export const NodeMailerHTML = {
  [NodeMailerTemplate.RESET_PASSWORD_REQUEST]: `
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="text-align: center;">${NodeMailerSubject[NodeMailerTemplate.RESET_PASSWORD_REQUEST]}</h2>
          <p>Hello {{USER_FIRSTNAME}},</p>
          <p>You requested a password change. Here is the verification code:</p>
          <p style="font-size: 24px; font-weight: bold; text-align: center;">{{SECRET_TOKEN}}</p>
          <p>This verification code is valid for the next 10 minutes. Please use this code to complete the password change process.</p>
          <p>Best regards,<br>The Support Team</p>
      </div>
    </body>
  `
};
