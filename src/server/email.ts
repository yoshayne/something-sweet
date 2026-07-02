// Brevo transactional email, exposed with the same `.send()` shape the worker's
// ~9 call sites already use for the Mocha `EMAILS` binding. No call site changes.

type EmailParams = {
  to: string;
  subject: string;
  html_body?: string;
  text_body?: string;
  reply_to?: string;
};

export const EMAILS = {
  async send(params: EmailParams) {
    const body: Record<string, unknown> = {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL || "erica@somethingsweet.shop",
        name: process.env.BREVO_SENDER_NAME || "Something Sweet by Erica",
      },
      to: [{ email: params.to }],
      subject: params.subject,
    };

    if (params.html_body) body.htmlContent = params.html_body;
    // Brevo requires htmlContent; if only text was provided, wrap it.
    if (!params.html_body && params.text_body) {
      body.htmlContent = `<pre style="font-family:inherit;white-space:pre-wrap">${params.text_body}</pre>`;
    }
    if (params.text_body) body.textContent = params.text_body;
    if (params.reply_to) body.replyTo = { email: params.reply_to };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY || "",
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Brevo send failed:", res.status, err);
      return { success: false, error: err };
    }

    const data = (await res.json()) as { messageId?: string };
    return { success: true, message_id: data.messageId };
  },
};
