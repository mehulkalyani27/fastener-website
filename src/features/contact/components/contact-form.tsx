"use client";

import { type FormEvent, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/form-field";
import { contactContent } from "@/data/home";
import { submitInquiry } from "@/features/contact/actions";
import {
  CONTACT_REQUIRED_MESSAGE,
  type InquiryErrors,
  validateInquiryFields,
} from "@/features/contact/client-validation";
import type { InquiryField, InquiryFormState, InquiryValues } from "@/features/contact/types";
import { INQUIRY_LIMITS } from "@/features/contact/validation";

const initialState: InquiryFormState = { status: "idle" };
const FIELD_ORDER: InquiryField[] = ["name", "phone", "email", "message"];

function readValues(form: HTMLFormElement): InquiryValues {
  const data = new FormData(form);
  const read = (field: InquiryField) => String(data.get(field) ?? "");
  return { name: read("name"), phone: read("phone"), email: read("email"), message: read("message") };
}

/**
 * The inquiry form. React clears uncontrolled fields after every action, so the submitted values
 * come back in the state and are used as defaults: a rejected form keeps its input, a sent one empties.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  // Errors found in the browser (null until the form is checked); otherwise those from the server.
  const [clientErrors, setClientErrors] = useState<InquiryErrors | null>(null);
  const errors = clientErrors ?? state.fieldErrors ?? {};
  const invalidFields = Object.keys(errors);
  const values = state.values;
  const needsContact = errors.email === CONTACT_REQUIRED_MESSAGE;
  const hasErrorMessage = clientErrors ? invalidFields.length > 0 : state.status === "error";
  const message = clientErrors ? (invalidFields.length > 0 ? contactContent.invalidMessage : "") : state.message;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const found = validateInquiryFields(readValues(event.currentTarget));
    const invalid = FIELD_ORDER.filter((field) => found[field] || (field === "phone" && found.email === CONTACT_REQUIRED_MESSAGE));
    if (invalid.length === 0) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    setClientErrors(found);
    event.currentTarget.querySelector<HTMLElement>(`#${invalid[0]}`)?.focus();
  }

  // Once a field has an error, re-check as the user types so the error goes as soon as the input is valid.
  function handleChange(event: FormEvent<HTMLFormElement>) {
    if (invalidFields.length === 0) return;
    const found = validateInquiryFields(readValues(event.currentTarget));
    setClientErrors(Object.fromEntries(Object.entries(found).filter(([field]) => invalidFields.includes(field))));
  }

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={handleSubmit}
      onChange={handleChange}
      aria-labelledby="contact-title"
      data-reveal
      className="grid gap-x-5 gap-y-6 rounded-card border border-border bg-background p-5 shadow-raised sm:grid-cols-2 sm:p-8 lg:p-10"
    >
      <TextField
        id="name"
        label="Name"
        autoComplete="name"
        required
        minLength={INQUIRY_LIMITS.name.min}
        maxLength={INQUIRY_LIMITS.name.max}
        defaultValue={values?.name}
        error={errors.name}
      />
      <TextField
        id="phone"
        label="Phone"
        type="tel"
        autoComplete="tel"
        maxLength={INQUIRY_LIMITS.phone.max}
        defaultValue={values?.phone}
        error={errors.phone}
        {...(needsContact && { "aria-invalid": true, "aria-describedby": "email-error" })}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        maxLength={INQUIRY_LIMITS.email.max}
        defaultValue={values?.email}
        error={errors.email}
        className="sm:col-span-2"
      />
      <TextAreaField
        id="message"
        label="Message"
        placeholder="Steel thickness, application, or anything else we should know"
        required
        minLength={INQUIRY_LIMITS.message.min}
        maxLength={INQUIRY_LIMITS.message.max}
        defaultValue={values?.message}
        error={errors.message}
        className="sm:col-span-2"
      />

      {/* Honeypot: hidden from people, but a bot filling every field gives itself away. */}
      <div hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:gap-5">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? contactContent.sendingLabel : contactContent.submitLabel}
        </Button>
        <p role="status" className={`text-sm ${hasErrorMessage ? "text-danger" : "text-muted"}`}>
          {message}
        </p>
      </div>
    </form>
  );
}
