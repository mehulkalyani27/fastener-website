"use client";

import { type FormEvent, useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/form-field";
import { PhoneField } from "@/features/contact/components/phone-field";
import { contactContent } from "@/data/home";
import { submitInquiry } from "@/features/contact/actions";
import type { InquiryErrors } from "@/features/contact/client-validation";
import { CONTACT_REQUIRED_MESSAGE, INQUIRY_LIMITS } from "@/features/contact/rules";
import type { InquiryField, InquiryFormState, InquiryValues } from "@/features/contact/types";

const initialState: InquiryFormState = { status: "idle" };
const FIELD_ORDER: InquiryField[] = ["name", "phone", "email", "message"];

// The checks include the phone-number library, so they load on demand (when the form is first touched)
// instead of with the page.
type Validator = typeof import("@/features/contact/client-validation");
let validator: Validator | undefined;
const loadValidator = () => import("@/features/contact/client-validation").then((module) => (validator = module));

function readValues(form: HTMLFormElement): InquiryValues {
  const data = new FormData(form);
  const read = (field: InquiryField | "phoneCountry") => String(data.get(field) ?? "");
  return {
    name: read("name"),
    phone: read("phone"),
    email: read("email"),
    message: read("message"),
    phoneCountry: read("phoneCountry"),
  };
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
  const checkFailed = useRef(false);
  const hasErrorMessage = clientErrors ? invalidFields.length > 0 : state.status === "error";
  const message = clientErrors ? (invalidFields.length > 0 ? contactContent.invalidMessage : "") : state.message;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    if (!validator) {
      // Sent before the checks arrived: wait for them, then submit again. If they cannot load, send
      // anyway; the server runs the same checks.
      if (checkFailed.current) return;
      event.preventDefault();
      loadValidator().then(
        () => form.requestSubmit(),
        () => {
          checkFailed.current = true;
          form.requestSubmit();
        },
      );
      return;
    }
    const found = validator.validateInquiryFields(readValues(form));
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
    const form = event.currentTarget;
    loadValidator().then((module) => {
      const found = module.validateInquiryFields(readValues(form));
      setClientErrors(Object.fromEntries(Object.entries(found).filter(([field]) => invalidFields.includes(field))));
    }, () => {});
  }

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={handleSubmit}
      onChange={handleChange}
      onFocus={() => void loadValidator().catch(() => {})}
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
        className="sm:col-span-2"
      />
      <PhoneField
        maxLength={INQUIRY_LIMITS.phone.max}
        defaultCountry={values?.phoneCountry}
        defaultValue={values?.phone}
        error={errors.phone}
        className="sm:col-span-2"
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
