"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { submitContact } from "@/actions/contact";
import { ArrowRight, Check } from "@/components/ui/Icons";
import { initialContactState } from "@/lib/schema";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Sending…" : "Send message"}
      {pending ? null : <ArrowRight />}
    </button>
  );
}

export function ContactForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(submitContact, initialContactState);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const renderedAtRef = useRef<HTMLInputElement>(null);

  // Stamped on the client after mount so the timing check measures real fill
  // time, not time since the page was built. Written straight to the input —
  // it is DOM state, never rendered from React.
  useEffect(() => {
    if (renderedAtRef.current) {
      renderedAtRef.current.value = String(Date.now());
    }
  }, []);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const err = state.fieldErrors;

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6">
      <input
        ref={renderedAtRef}
        type="hidden"
        name="renderedAt"
        defaultValue="0"
      />

      {/* Honeypot. Hidden from users, visible to naive bots. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="name" className="field-label">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            className="field-input"
            placeholder="Your name"
            aria-invalid={err.name ? "true" : undefined}
            aria-describedby={err.name ? "name-error" : undefined}
          />
          {err.name ? (
            <p id="name-error" className="field-error">
              {err.name}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={160}
            className="field-input"
            placeholder="you@company.com"
            aria-invalid={err.email ? "true" : undefined}
            aria-describedby={err.email ? "email-error" : undefined}
          />
          {err.email ? (
            <p id="email-error" className="field-error">
              {err.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="company" className="field-label">
          Company <span className="normal-case">(optional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          maxLength={120}
          className="field-input"
          placeholder="Where you work"
        />
      </div>

      <div className="field">
        <label htmlFor="message" className="field-label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={7}
          minLength={20}
          maxLength={4000}
          className="field-input resize-y"
          placeholder="What are you building, and where do you need help?"
          aria-invalid={err.message ? "true" : undefined}
          aria-describedby={err.message ? "message-error" : undefined}
        />
        {err.message ? (
          <p id="message-error" className="field-error">
            {err.message}
          </p>
        ) : null}
      </div>

      {/* Announced to screen readers the moment the action resolves. */}
      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className={state.status === "idle" ? "sr-only" : undefined}
      >
        {state.status !== "idle" ? (
          <div className="form-status" data-tone={state.status}>
            {state.status === "success" ? <Check /> : null}
            <span>{state.message}</span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton />
        <p className="meta">
          or email{" "}
          <a href={`mailto:${email}`} className="link">
            {email}
          </a>
        </p>
      </div>
    </form>
  );
}
