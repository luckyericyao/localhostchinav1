export const contactEmail =
  process.env.NEXT_PUBLIC_LOCALHOST_CONTACT_EMAIL || "hello@localhost.global";

type InquiryMailField = {
  label: string;
  value?: string | string[];
};

type InquiryMailPayload = {
  role: string;
  name: string;
  email: string;
  message: string;
  source: string;
  fields?: InquiryMailField[];
};

function formatValue(value?: string | string[]) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value?.trim() || "";
}

export function buildInquiryMailto({
  role,
  name,
  email,
  message,
  source,
  fields = []
}: InquiryMailPayload) {
  const detailLines = fields
    .map(({ label, value }) => {
      const formatted = formatValue(value);
      return formatted ? `${label}: ${formatted}` : "";
    })
    .filter(Boolean);

  const body = [
    "Localhost private route review",
    "",
    `Source: ${source}`,
    `Role: ${role}`,
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
    "",
    detailLines.length ? "Structured details:" : "",
    ...detailLines
  ]
    .filter((line, index, lines) => line || lines[index - 1])
    .join("\n");

  const subject = `Localhost ${role} inquiry - ${name}`;

  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function openInquiryMailto(payload: InquiryMailPayload) {
  window.location.href = buildInquiryMailto(payload);
}
