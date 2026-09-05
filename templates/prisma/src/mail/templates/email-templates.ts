// nestforge:feature-file:redis
const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

export function verifyEmailTemplate(name: string, token: string): string {
    const link = `${appUrl}/auth/verify-email?token=${token}`;

    return `
    <div style="font-family: sans-serif; line-height: 1.5;">
      <h2>Hello, ${name}!</h2>
      <p>Confirm your email by clicking the link below:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;
}

export function resetPasswordTemplate(name: string, token: string): string {
    const link = `${appUrl}/auth/reset-password?token=${token}`;

    return `
    <div style="font-family: sans-serif; line-height: 1.5;">
      <h2>Hello, ${name}!</h2>
      <p>We received a request to reset your password. Click the link below to continue:</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you did not request this, you can ignore this email. The link expires in 1 hour.</p>
    </div>
  `;
}
