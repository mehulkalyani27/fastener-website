import { type CountryCode, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js/max";
import { countryName, DEFAULT_COUNTRY, isCountry } from "@/features/contact/countries";
import { CONTACT_REQUIRED_MESSAGE, INQUIRY_LIMITS } from "@/features/contact/rules";
import type { InquiryField, InquiryValues } from "@/features/contact/types";

export { CONTACT_REQUIRED_MESSAGE, INQUIRY_LIMITS };

const PHONE_CHARACTERS = /^[0-9+()\-.\s]+$/;
/** ASCII addresses: dot-separated local part, a dotted domain of letters, digits and inner hyphens, and a letters-only ending. */
const EMAIL_SHAPE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/** One line: control characters removed, whitespace collapsed. */
const singleLine = (value: string) => value.replace(CONTROL_CHARACTERS, "").replace(/\s+/g, " ").trim();

const multiLine = (value: string) =>
  value.replace(/\r\n?/g, "\n").replace(CONTROL_CHARACTERS, "").replace(/\n{3,}/g, "\n\n").trim();

/** Length in characters as the database counts them (an emoji is one character, not two UTF-16 units). */
const length = (value: string) => Array.from(value).length;

export type ValidationResult =
  | { ok: true; value: InquiryValues }
  | { ok: false; fieldErrors: Partial<Record<InquiryField, string>>; values: InquiryValues };

const text = (entry: FormDataEntryValue | null | undefined) => (typeof entry === "string" ? entry : "");

/** The phone number as an international (E.164) number, or the reason it is not valid for the chosen country. */
function checkPhone(phone: string, country: string): { number: string } | { error: string } {
  if (!isCountry(country)) return { error: "Please choose a valid country." };
  const name = countryName(country);
  const parsed = PHONE_CHARACTERS.test(phone) ? parsePhoneNumberFromString(phone, country as CountryCode) : undefined;
  if (!parsed?.isValid() || /^(\d)\1+$/.test(parsed.nationalNumber)) return { error: `Please enter a valid ${name} phone number.` };
  if (parsed.countryCallingCode !== getCountryCallingCode(country as CountryCode)) {
    return { error: `That number is not from ${name}. Choose its country first.` };
  }
  return { number: parsed.number };
}

/**
 * Cleans and checks the submitted fields. The database repeats these limits as constraints. Phone
 * and email are each optional, but at least one is required; a given one must be valid. An empty
 * value stays an empty string here (the service stores it as null).
 */
export function validateInquiry(input: Partial<Record<InquiryField | "phoneCountry", FormDataEntryValue | null>>): ValidationResult {
  const values: InquiryValues = {
    name: singleLine(text(input.name)),
    phone: singleLine(text(input.phone)),
    email: singleLine(text(input.email)),
    message: multiLine(text(input.message)),
    phoneCountry: text(input.phoneCountry).trim().toUpperCase() || DEFAULT_COUNTRY,
  };
  const errors: Partial<Record<InquiryField, string>> = {};
  const { name, phone, email, message } = INQUIRY_LIMITS;

  if (length(values.name) < name.min) errors.name = `Please enter your name (at least ${name.min} characters).`;
  else if (length(values.name) > name.max) errors.name = `Please keep your name under ${name.max} characters.`;

  let phoneNumber = values.phone;
  if (values.phone) {
    const checked = length(values.phone) > phone.max ? { error: `Please enter a valid ${countryName(values.phoneCountry)} phone number.` } : checkPhone(values.phone, values.phoneCountry);
    if ("error" in checked) errors.phone = checked.error;
    else phoneNumber = checked.number;
  }

  if (
    values.email &&
    (!EMAIL_SHAPE.test(values.email) ||
      length(values.email) < email.min ||
      length(values.email) > email.max ||
      length(values.email.split("@")[0]) > email.localMax)
  ) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.phone && !values.email) errors.email = CONTACT_REQUIRED_MESSAGE;

  if (length(values.message) < message.min) errors.message = `Please tell us a little more (at least ${message.min} characters).`;
  else if (length(values.message) > message.max) errors.message = `Please keep your message under ${message.max} characters.`;

  return Object.keys(errors).length > 0 ? { ok: false, fieldErrors: errors, values } : { ok: true, value: { ...values, phone: phoneNumber } };
}
