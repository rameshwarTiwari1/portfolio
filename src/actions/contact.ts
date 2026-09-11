"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { sendContactEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import {
  contactSchema,
  enquirySchema,
  MIN_FILL_MS,
  type ContactState,
  type EnquiryInput,
} from "@/lib/schema";

const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const SUCCESS =
  "Thanks — your message is on its way. I usually reply within a day.";

const FAILURE =
  "Something went wrong sending that. Please email me directly at rameshwar.kes@gmail.com.";

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

async function handle(
  formData: FormData,
  kind: "contact" | "enquiry",
): Promise<ContactState> {
  const schema = kind === "enquiry" ? enquirySchema : contactSchema;

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    message: formData.get("message"),
    website: formData.get("website"),
    renderedAt: formData.get("renderedAt"),
    projectType: formData.get("projectType"),
    budget: formData.get("budget"),
    timeline: formData.get("timeline"),
  });

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    const fieldErrors: ContactState["fieldErrors"] = {};

    for (const [key, messages] of Object.entries(flat.fieldErrors)) {
      if (messages?.[0]) {
        fieldErrors[key as keyof EnquiryInput] = messages[0];
      }
    }

    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  // --- Bot checks -------------------------------------------------------
  // Both fail silently as a success so bots get no signal to adapt against.
  if (data.website) {
    return { status: "success", message: SUCCESS, fieldErrors: {} };
  }

  const elapsed = Date.now() - data.renderedAt;
  if (data.renderedAt > 0 && elapsed < MIN_FILL_MS) {
    return { status: "success", message: SUCCESS, fieldErrors: {} };
  }

  // --- Rate limit -------------------------------------------------------
  const ip = await clientIp();
  const limit = rateLimit(`contact:${ip}`, LIMIT, WINDOW_MS);

  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return {
      status: "error",
      message: `That is a few messages in a short time. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}, or email me directly.`,
      fieldErrors: {},
    };
  }

  // --- Send -------------------------------------------------------------
  try {
    await sendContactEmail(data, { ip, kind });
    return {
      status: "success",
      message:
        kind === "enquiry"
          ? "Thanks — I have your brief. You will hear back from me within one working day."
          : SUCCESS,
      fieldErrors: {},
    };
  } catch (error) {
    // Never leak SMTP internals to the client.
    console.error(`[${kind}] send failed:`, error);
    return { status: "error", message: FAILURE, fieldErrors: {} };
  }
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  return handle(formData, "contact");
}

export async function submitEnquiry(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  return handle(formData, "enquiry");
}
