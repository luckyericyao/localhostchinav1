type InquiryEmail = {
  body: string;
  email: string;
  inquiryId: string;
  subject: string;
};

type DeliveryConfig = {
  apiKey?: string;
  from?: string;
  to?: string;
};

type DeliveryResult =
  | { ok: true; providerMessageId: string }
  | { ok: false };

export async function sendInquiryEmail(
  inquiry: InquiryEmail,
  config: DeliveryConfig,
  request: typeof fetch = fetch
): Promise<DeliveryResult> {
  if (!config.apiKey || !config.from || !config.to) return { ok: false };

  // Keep the payload and key identical if the provider accepted a timed-out call.
  const body = JSON.stringify({
    from: config.from,
    reply_to: inquiry.email,
    subject: inquiry.subject,
    text: inquiry.body,
    to: [config.to]
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await request("https://api.resend.com/emails", {
        body,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `private-route-review/${inquiry.inquiryId}`
        },
        method: "POST",
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const receipt: unknown = await response.json().catch(() => null);
        const id = receipt && typeof receipt === "object" && "id" in receipt
          ? receipt.id
          : undefined;
        if (typeof id === "string" && id.trim() && id.length <= 120) {
          return { ok: true, providerMessageId: id.trim() };
        }
        // A status code without a provider receipt cannot confirm acceptance.
      } else if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const seconds = retryAfter === null ? 0.5 : Number(retryAfter);
        // Longer or date-based waits should use recovery, not hold the form open.
        if (!Number.isFinite(seconds) || seconds < 0 || seconds > 1) {
          return { ok: false };
        }
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
        }
      } else if (response.status === 409) {
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } else if (response.status < 500) {
        return { ok: false };
      }
    } catch {
      // One retry covers a transient network failure without exposing details.
    }
  }

  return { ok: false };
}
