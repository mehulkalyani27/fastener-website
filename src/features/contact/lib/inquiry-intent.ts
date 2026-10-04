import { useSyncExternalStore } from "react";

/** Text for the contact form's message, set by an action such as "Request Sample Pack". */
export type InquiryIntent = { message: string; id: number };

let current: InquiryIntent | null = null;
let counter = 0;
const listeners = new Set<() => void>();

export function setInquiryIntent(message: string) {
  current = { message, id: ++counter };
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useInquiryIntent = () =>
  useSyncExternalStore(subscribe, () => current, () => null);

/** Links such as /contact?subject=sample-pack open the form with that request started. */
export const isSamplePackSearch = (search: string) => new URLSearchParams(search).get("subject") === "sample-pack";
