// nestforge:feature-file:redis
const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

export function verifyEmailTemplate(name: string, token: string): string {
    const link = `${appUrl}/auth/verify-email?token=${token}`;

    return `
    <div style="font-family: sans-serif; line-height: 1.5;">
      <h2>Olá, ${name}!</h2>
      <p>Confirme seu e-mail clicando no link abaixo:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Esse link expira em 24 horas.</p>
    </div>
  `;
}

export function resetPasswordTemplate(name: string, token: string): string {
    const link = `${appUrl}/auth/reset-password?token=${token}`;

    return `
    <div style="font-family: sans-serif; line-height: 1.5;">
      <h2>Olá, ${name}!</h2>
      <p>Recebemos um pedido para redefinir sua senha. Clique no link abaixo para continuar:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Se você não pediu isso, pode ignorar este e-mail. O link expira em 1 hora.</p>
    </div>
  `;
}