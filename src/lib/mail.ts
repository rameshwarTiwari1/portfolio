import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import type { ContactInput, EnquiryInput } from "./schema";

/**
 * Gmail SMTP via Nodemailer. No third-party email service, no API key.
 *
 * Requires a Google App Password (not your account password):
 *   https://myaccount.google.com/apppasswords
 */

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "SMTP_USER and SMTP_PASSWORD must be set. See .env.example.",
    );
  }

  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user, pass },
    // Serverless functions time out around 10—30s; fail fast enough to return
    // a useful error instead of a hung request.
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
  });

  return transporter;
}

/** Escape user input before it reaches the HTML body. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type MailInput = ContactInput | Partial<EnquiryInput> & ContactInput;

function detailRows(input: MailInput): [string, string][] {
  const enquiry = input as Partial<EnquiryInput>;

  return [
    ["Name", input.name],
    ["Email", input.email],
    ...(input.company ? ([["Company", input.company]] as [string, string][]) : []),
    ...(enquiry.projectType
      ? ([["Project", enquiry.projectType]] as [string, string][])
      : []),
    ...(enquiry.budget
      ? ([["Budget", enquiry.budget]] as [string, string][])
      : []),
    ...(enquiry.timeline
      ? ([["Timeline", enquiry.timeline]] as [string, string][])
      : []),
  ];
}

function buildHtml(input: MailInput, meta: { ip: string }): string {
  const rows: [string, string][] = [
    ...detailRows(input),
    ["IP", meta.ip],
    ["Received", new Date().toISOString()],
  ];

  const table = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 14px 6px 0;color:#71717a;font:500 12px/1.5 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${esc(label)}</td>
        <td style="padding:6px 0;color:#18181b;font:400 14px/1.6 system-ui,sans-serif">${esc(value)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#f4f4f5;padding:32px 16px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden">
    <div style="padding:20px 28px;border-bottom:1px solid #e4e4e7;background:#fafafa">
      <p style="margin:0;font:600 13px/1.4 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#8a6a12">New enquiry</p>
    </div>
    <div style="padding:24px 28px">
      <table style="border-collapse:collapse;width:100%">${table}</table>
      <div style="margin-top:22px;padding-top:22px;border-top:1px solid #e4e4e7">
        <p style="margin:0 0 10px;font:500 12px/1.5 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;color:#71717a">Message</p>
        <div style="font:400 15px/1.7 system-ui,sans-serif;color:#18181b;white-space:pre-wrap">${esc(input.message)}</div>
      </div>
    </div>
  </div>
</body></html>`;
}

function buildText(input: MailInput, meta: { ip: string }): string {
  const details = detailRows(input)
    .map(([label, value]) => `${`${label}:`.padEnd(10)}${value}`)
    .join("\n");

  return [
    details,
    `${"IP:".padEnd(10)}${meta.ip}`,
    `${"Time:".padEnd(10)}${new Date().toISOString()}`,
    "",
    "Message",
    "-------",
    input.message,
  ].join("\n");
}

export async function sendContactEmail(
  input: MailInput,
  meta: { ip: string; kind?: "contact" | "enquiry" },
): Promise<void> {
  const to = process.env.CONTACT_TO ?? process.env.SMTP_USER;
  const from = process.env.SMTP_USER;

  if (!to || !from) {
    throw new Error("CONTACT_TO / SMTP_USER not configured.");
  }

  const isEnquiry = meta.kind === "enquiry";
  const label = isEnquiry ? "Project enquiry" : "Portfolio enquiry";
  const budget = (input as Partial<EnquiryInput>).budget;

  await getTransporter().sendMail({
    // Gmail rewrites the From header to the authenticated account, so send as
    // yourself and put the visitor in replyTo — that way hitting reply in your
    // inbox goes straight back to them.
    from: `"${label} — ${input.name}" <${from}>`,
    to,
    replyTo: `"${input.name}" <${input.email}>`,
    subject: [
      isEnquiry ? "[Project]" : "[Contact]",
      input.name,
      input.company ? `(${input.company})` : null,
      budget ? `· ${budget}` : null,
    ]
      .filter(Boolean)
      .join(" "),
    text: buildText(input, meta),
    html: buildHtml(input, meta),
  });
}

/** Test-only. */
export function resetTransporter(): void {
  transporter = null;
}
