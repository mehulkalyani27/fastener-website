/** Limits shared by the form attributes, the server check and (as constraints) the database. */
export const INQUIRY_LIMITS = {
  name: { min: 2, max: 100 },
  phone: { min: 7, max: 20 },
  email: { min: 5, max: 254, localMax: 64 },
  message: { min: 10, max: 2000 },
} as const;

export const CONTACT_REQUIRED_MESSAGE = "Please enter a phone number or an email address.";
