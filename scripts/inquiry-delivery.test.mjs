import assert from "node:assert/strict";
import test from "node:test";
import { sendInquiryEmail } from "../lib/inquiryEmail.ts";

const inquiry = {
  body: "Name: Test Traveler\nRoute: Shanxi",
  email: "traveler@example.test",
  inquiryId: "LH-test-receipt",
  subject: "Private route review"
};
const config = {
  apiKey: "test-key-not-a-secret",
  from: "review@example.test",
  to: "owner@example.test"
};
const receipt = () => Response.json({ id: "provider-receipt" });

function mockRequest(steps) {
  const calls = [];
  const request = async (url, options) => {
    calls.push({ url, options });
    assert.ok(steps.length, "Unexpected extra provider attempt");
    const next = steps.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  return { request, calls };
}

// No test uses a real API key, environment config, or network request.
test("provider receipt confirms acceptance and preserves reply address", async () => {
  const mock = mockRequest([receipt()]);
  assert.deepEqual(await sendInquiryEmail(inquiry, config, mock.request), {
    ok: true, providerMessageId: "provider-receipt"
  });
  const { url, options } = mock.calls[0];
  assert.equal(url, "https://api.resend.com/emails");
  assert.equal(options.method, "POST");
  assert.deepEqual(JSON.parse(options.body), {
    from: config.from, reply_to: inquiry.email, subject: inquiry.subject,
    text: inquiry.body, to: [config.to]
  });
  assert.ok(options.signal instanceof AbortSignal);
});

test("missing delivery configuration does not call provider", async () => {
  for (const key of Object.keys(config)) {
    const mock = mockRequest([]);
    assert.deepEqual(await sendInquiryEmail(inquiry, { ...config, [key]: "" }, mock.request), { ok: false });
    assert.equal(mock.calls.length, 0);
  }
});

test("2xx without a valid receipt never reports success", async () => {
  for (const body of [{}, { id: " " }, { id: 42 }, null, { id: "x".repeat(121) }]) {
    const mock = mockRequest([Response.json(body), Response.json(body)]);
    assert.deepEqual(await sendInquiryEmail(inquiry, config, mock.request), { ok: false });
    assert.equal(mock.calls.length, 2);
  }
  const mock = mockRequest([new Response("not JSON"), new Response("not JSON")]);
  assert.deepEqual(await sendInquiryEmail(inquiry, config, mock.request), { ok: false });
});

test("retry preserves payload and idempotency key after uncertain acceptance", async () => {
  const mock = mockRequest([new Error("Simulated timeout"), receipt()]);
  assert.equal((await sendInquiryEmail(inquiry, config, mock.request)).ok, true);
  const [first, second] = mock.calls;
  assert.equal(first.options.body, second.options.body);
  assert.deepEqual(first.options.headers, second.options.headers);
  assert.equal(first.options.headers["Idempotency-Key"], "private-route-review/LH-test-receipt");
  assert.notEqual(first.options.signal, second.options.signal);
});

test("transient service failure retries once", async () => {
  const mock = mockRequest([new Response(null, { status: 503 }), receipt()]);
  assert.equal((await sendInquiryEmail(inquiry, config, mock.request)).ok, true);
  assert.equal(mock.calls.length, 2);
});

test("short rate limit retries once", async () => {
  const mock = mockRequest([
    new Response(null, { status: 429, headers: { "Retry-After": "0" } }), receipt()
  ]);
  assert.equal((await sendInquiryEmail(inquiry, config, mock.request)).ok, true);
  assert.equal(mock.calls.length, 2);
});

test("long or invalid rate limit falls back without holding the form", async () => {
  for (const retryAfter of ["60", "invalid", "-1"]) {
    const mock = mockRequest([new Response(null, {
      status: 429, headers: { "Retry-After": retryAfter }
    })]);
    assert.deepEqual(await sendInquiryEmail(inquiry, config, mock.request), { ok: false });
    assert.equal(mock.calls.length, 1);
  }
});

test("concurrent provider conflict can recover with the same key", async () => {
  const mock = mockRequest([new Response(null, { status: 409 }), receipt()]);
  assert.equal((await sendInquiryEmail(inquiry, config, mock.request)).ok, true);
  assert.deepEqual(mock.calls[0].options.headers, mock.calls[1].options.headers);
});

test("permanent rejection does not retry", async () => {
  for (const status of [400, 401, 403, 422]) {
    const mock = mockRequest([new Response(null, { status })]);
    assert.deepEqual(await sendInquiryEmail(inquiry, config, mock.request), { ok: false });
    assert.equal(mock.calls.length, 1);
  }
});

test("repeated network failure returns recovery without leaking errors", async () => {
  const mock = mockRequest([new Error("private upstream details"), new Error("private upstream details")]);
  assert.deepEqual(await sendInquiryEmail(inquiry, config, mock.request), { ok: false });
  assert.equal(mock.calls.length, 2);
});
