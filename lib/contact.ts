export const localhostContactEmail =
  process.env.LOCALHOST_CONTACT_EMAIL || "hello@localhostglobal.com";

// Keep internal delivery separate from the public mailto fallback address.
export const localhostDeliveryEmail =
  process.env.RESEND_TO_EMAIL || localhostContactEmail;

export const localhostResponseWindow =
  process.env.LOCALHOST_RESPONSE_WINDOW || "within two working days";
