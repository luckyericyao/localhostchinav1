import { approvedOperator } from "@/lib/operator";

export const localhostContactEmail =
  process.env.LOCALHOST_CONTACT_EMAIL?.trim() || approvedOperator.contact;

// Keep internal delivery separate from the public mailto fallback address.
export const localhostDeliveryEmail =
  process.env.RESEND_TO_EMAIL?.trim() || localhostContactEmail;

export const localhostResponseWindow =
  process.env.LOCALHOST_RESPONSE_WINDOW || "within two working days";

export const localhostReplyTarget =
  `We aim to reply ${localhostResponseWindow} after receiving your inquiry.`;
