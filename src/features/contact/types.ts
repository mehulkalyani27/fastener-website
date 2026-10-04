export type InquiryField = "name" | "phone" | "email" | "message";

/** `phone` is what was typed (the national number, or the international one once validated); `phoneCountry` is its ISO country code. */
export type InquiryValues = Record<InquiryField, string> & { phoneCountry: string };

/** What the form shows after a submission. `values` are echoed back so a rejected form keeps its input. */
export type InquiryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<InquiryField, string>>;
  values?: InquiryValues;
};
