"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { submitEnquiry } from "@/actions/contact";
import { ArrowRight, Check } from "@/components/ui/Icons";
import { initialContactState } from "@/lib/schema";
import { BUDGET_OPTIONS, PROJECT_TYPES } from "@/lib/services";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
      {pending ? "Sending…" : "Send project brief"}
      {pending ? null : <ArrowRight />}
    </button>
  );
}

export function EnquiryForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(submitEnquiry, initialContactState);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const renderedAtRef = useRef<HTMLInputElement>(null);

  // Stamped on the client after mount so the timing check measures real fill
  // time, not time since the page was built.
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
    <form ref={formRef} action={formAction} className="flex flex-col gap-7">
      <input
        ref={renderedAtRef}
        type="hidden"
        name="renderedAt"
        defaultValue="0"
      />

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="eq-website">Website</label>
        <input
          id="eq-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="eq-name" className="field-label">
            Your name
          </label>
          <input
            id="eq-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            className="field-input"
            placeholder="Priya Sharma"
            aria-invalid={err.name ? "true" : undefined}
            aria-describedby={err.name ? "eq-name-error" : undefined}
          />
          {err.name ? (
            <p id="eq-name-error" className="field-error">
              {err.name}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="eq-email" className="field-label">
            Email
          </label>
          <input
            id="eq-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={160}
            className="field-input"
            placeholder="you@company.com"
            aria-invalid={err.email ? "true" : undefined}
            aria-describedby={err.email ? "eq-email-error" : undefined}
          />
          {err.email ? (
            <p id="eq-email-error" className="field-error">
              {err.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="eq-company" className="field-label">
            Company <span className="text-ink-faint">(optional)</span>
          </label>
          <input
            id="eq-company"
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={120}
            className="field-input"
            placeholder="Where you work"
          />
        </div>

        <div className="field">
          <label htmlFor="eq-timeline" className="field-label">
            Timeline <span className="text-ink-faint">(optional)</span>
          </label>
          <input
            id="eq-timeline"
            name="timeline"
            type="text"
            maxLength={120}
            className="field-input"
            placeholder="e.g. start in March, live by June"
          />
        </div>
      </div>

      <fieldset className="field border-0 p-0">
        <legend className="field-label mb-2">What kind of work is it?</legend>
        <div className="choice-grid">
          {PROJECT_TYPES.map((type) => (
            <label key={type} className="choice">
              <input type="radio" name="projectType" value={type} />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field border-0 p-0">
        <legend className="field-label mb-2">
          Rough budget
          <span className="ml-2 font-normal text-ink-faint">
            so I can tell you honestly whether it is feasible
          </span>
        </legend>
        <div className="choice-grid">
          {BUDGET_OPTIONS.map((option) => (
            <label key={option} className="choice">
              <input type="radio" name="budget" value={option} />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="eq-message" className="field-label">
          What are you building?
        </label>
        <textarea
          id="eq-message"
          name="message"
          required
          rows={7}
          minLength={20}
          maxLength={4000}
          className="field-input resize-y"
          placeholder="The product, where it hurts right now, and what success looks like. A paragraph is plenty — we can go deeper on a call."
          aria-invalid={err.message ? "true" : undefined}
          aria-describedby={err.message ? "eq-message-error" : undefined}
        />
        {err.message ? (
          <p id="eq-message-error" className="field-error">
            {err.message}
          </p>
        ) : null}
      </div>

      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className={state.status === "idle" ? "sr-only" : undefined}
      >
        {state.status !== "idle" ? (
          <div className="form-status" data-tone={state.status}>
            {state.status === "success" ? <Check className="mt-1 shrink-0" /> : null}
            <span>{state.message}</span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <SubmitButton />
        <p className="meta">
          Or email{" "}
          <a href={`mailto:${email}`} className="link">
            {email}
          </a>
        </p>
      </div>
    </form>
  );
}
