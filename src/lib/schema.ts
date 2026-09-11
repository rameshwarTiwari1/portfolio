import { z } from "zod";

/**
 * Contact form schema. Validated on the server — the client-side pass is a
 * convenience, never a trust boundary.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "That name is too long."),

  email: z
    .email("Please enter a valid email address.")
    .max(160, "That email address is too long."),

  company: z
    .string()
    .trim()
    .max(120, "That is too long.")
    .optional()
    .or(z.literal("")),

  message: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters so I can respond usefully.")
    .max(4000, "Please keep it under 4000 characters."),

  /** Honeypot — must stay empty. Real users never see this field. */
  website: z
    .string()
    .max(0, "Submission rejected.")
    .optional()
    .or(z.literal("")),

  /** Client render timestamp, used to reject instant bot submissions. */
  renderedAt: z.coerce.number().int().nonnegative(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Project enquiry. Same pipeline as the contact form, with the extra
 * qualifying fields a freelance lead needs — so a serious enquiry arrives
 * already scoped instead of starting with three rounds of questions.
 */
export const enquirySchema = contactSchema.extend({
  projectType: z.string().trim().max(60).optional().or(z.literal("")),
  budget: z.string().trim().max(40).optional().or(z.literal("")),
  timeline: z.string().trim().max(120).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<string, string>>;
};

export const initialContactState: ContactState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

/** Minimum time a human plausibly takes to fill the form. */
export const MIN_FILL_MS = 3_000;
