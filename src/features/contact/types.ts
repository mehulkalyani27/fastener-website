export type InquiryField = "name" | "phone" | "email" | "message";

export type InquiryValues = Record<InquiryField, string>;

/** What the form shows after a submission. `values` are echoed back so a rejected form keeps its input. */
export type InquiryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<InquiryField, string>>;
  values?: InquiryValues;
};
