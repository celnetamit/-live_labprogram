/**
 * Outbound email.
 *
 * Uses Resend's HTTP API when RESEND_API_KEY is set — a plain fetch, so there
 * is no SDK to install or keep updated. With no key configured the message is
 * written to the server log instead, which keeps password recovery usable in
 * local development without pretending mail was delivered.
 */

type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export function mailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function fromAddress(): string {
  return process.env.MAIL_FROM || "Panoptical Labs <onboarding@resend.dev>";
}

/** Returns true when the message was handed to a real provider. */
export async function sendMail({ to, subject, html, text }: Mail): Promise<boolean> {
  if (!mailConfigured()) {
    console.info(
      `[mail] No RESEND_API_KEY set — logging instead of sending.\n` +
        `       To: ${to}\n       Subject: ${subject}\n\n${text}\n`
    );
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromAddress(), to: [to], subject, html, text }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("[mail] Provider rejected the message:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mail] Send failed:", err);
    return false;
  }
}

export function passwordResetEmail(link: string, name: string | null) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const text =
    `${greeting}\n\n` +
    `Someone asked to reset the password for your Panoptical Labs account.\n` +
    `Open this link to choose a new one — it expires in 60 minutes and can only be used once:\n\n` +
    `${link}\n\n` +
    `If this wasn't you, ignore this email. Your password stays as it is.\n`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
      <h2 style="margin:0 0 16px">Reset your password</h2>
      <p style="margin:0 0 12px">${greeting}</p>
      <p style="margin:0 0 20px">Someone asked to reset the password for your Panoptical Labs account.</p>
      <p style="margin:0 0 24px">
        <a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">
          Choose a new password
        </a>
      </p>
      <p style="margin:0 0 12px;color:#555;font-size:14px">
        The link expires in 60 minutes and can only be used once.
      </p>
      <p style="margin:0;color:#555;font-size:14px">
        If this wasn't you, ignore this email — your password stays as it is.
      </p>
    </div>`;

  return { subject: "Reset your Panoptical Labs password", html, text };
}
