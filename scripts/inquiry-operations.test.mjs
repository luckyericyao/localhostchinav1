import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { publicOperator } from "../lib/operator.ts";
import { importReviewLog, readReviewEvent, replyDueAt, reviewOwner, reviewQueue, reviewReport } from "../lib/inquiryOperations.ts";

const inquiryId = "LH-2026-11-02-1234ABCD";
const at = "2026-11-02T03:00:00.000Z";

test("reply calendar uses China weekdays and explicit holidays", () => {
  assert.equal(replyDueAt("2026-11-06T16:30:00Z"), "2026-11-09T16:30:00.000Z");
  assert.equal(replyDueAt("2026-11-06T15:30:00Z"), "2026-11-10T15:30:00.000Z");
  assert.equal(replyDueAt(at), "2026-11-04T03:00:00.000Z");
  assert.equal(replyDueAt(at, ["2026-11-03"]), "2026-11-05T03:00:00.000Z");
  assert.throws(() => replyDueAt("bad timestamp"));
});

test("review imports whitelist metadata and reject browser claims", () => {
  const event = importReviewLog({ message: JSON.stringify({ kind: "localhost_inquiry", event: "delivery_success", recordedAt: at, inquiryId, reviewOwner: "china-review", email: "PRIVATE EMAIL", shortNote: "PRIVATE NOTE" }) });
  assert.deepEqual(event, { event: "provider_accepted", at, inquiryId, owner: "china-review" });
  assert.equal(JSON.stringify(event).includes("PRIVATE"), false);
  assert.equal(importReviewLog({ kind: "localhost_metric", event: "inquiry_delivery_success", inquiryId, recordedAt: at }), null);
  assert.equal(importReviewLog({ kind: "localhost_inquiry", event: "duplicate", inquiryId, recordedAt: at }), null);
  assert.equal(readReviewEvent({ event: "assigned", at, inquiryId, owner: "an-email@example.test" }), null);
  assert.equal(reviewOwner("private\nmessage"), undefined);
});

test("provider acceptance, inbox receipt and substantive reply remain separate", () => {
  const accepted = { event: "provider_accepted", at, inquiryId, owner: "china-review" };
  const before = reviewReport([accepted], "2026-11-10T03:00:00Z");
  assert.equal(before.providerAcceptanceRate, 1);
  assert.equal(before.confirmedDirectDeliveryRate, 0);
  assert.equal(before.substantiveReplyWithinTargetRate, null);
  const events = [accepted, { event: "inbox_received", at, inquiryId }, { event: "replied", at: "2026-11-03T03:00:00Z", inquiryId }];
  const after = reviewReport(events, "2026-11-10T03:00:00Z");
  assert.equal(after.confirmedDirectDeliveryRate, 1);
  assert.equal(after.substantiveReplyWithinTargetRate, 1);
  assert.equal(after.replySampleSize, 1);
});

test("unassigned, overdue, pending and unsent drafts are visible without invented zero rates", () => {
  assert.equal(reviewReport([]).providerAcceptanceRate, null);
  const draft = { event: "email_draft", at, inquiryId };
  assert.equal(reviewReport([draft]).preparedEmailOnly, 1);
  assert.equal(reviewReport([draft]).unassigned, 1);
  assert.equal(reviewReport([draft]).inboxConfirmed, 0);
  const failed = reviewQueue([{ event: "delivery_unconfigured", at, inquiryId }])[0];
  assert.equal(failed.status, "delivery_unconfigured");
  assert.match(failed.nextAction, /Restore delivery/);
  const events = [draft, { event: "assigned", owner: "reviewer-1", at, inquiryId }, { event: "inbox_received", at, inquiryId }];
  assert.equal(reviewReport(events, "2026-11-03T03:00:00Z").substantiveReplyWithinTargetRate, null);
  assert.equal(reviewReport(events, "2026-11-05T03:00:00Z").overdue, 1);
  assert.equal(reviewReport(events, "2026-11-05T03:00:00Z").substantiveReplyWithinTargetRate, 0);
  assert.equal(reviewQueue(events)[0].dueAt, "2026-11-04T03:00:00.000Z");
});

test("public contact uses only owner-approved details and does not invent a biography", () => {
  assert.deepEqual(publicOperator({}), { name: "Eric Yao", contact: "yaohaohui2014@hotmail.com", bio: "" });
  assert.equal(publicOperator({ LOCALHOST_OPERATOR_NAME: "Approved Name", LOCALHOST_OPERATOR_BIO: "Approved biography", LOCALHOST_CONTACT_EMAIL: "bad" }), null);
  assert.deepEqual(publicOperator({ LOCALHOST_OPERATOR_NAME: " Approved Name ", LOCALHOST_OPERATOR_BIO: " Approved biography ", LOCALHOST_CONTACT_EMAIL: "contact@example.test" }), { name: "Approved Name", bio: "Approved biography", contact: "contact@example.test" });
});

test("private ledger CLI imports idempotently, records the review lifecycle, and never retains traveler content", () => {
  const directory = mkdtempSync(join(tmpdir(), "localhost-review-test-"));
  const file = join(directory, "ledger.jsonl");
  const time = new Date(Date.now() - 8 * 86400000).toISOString();
  const run = (args, input) => spawnSync(process.execPath, ["--experimental-strip-types", new URL("./inquiry-reviews.mjs", import.meta.url).pathname, ...args], { encoding: "utf8", input, env: { ...process.env, LOCALHOST_REVIEW_LEDGER: file } });
  try {
    const log = JSON.stringify({ kind: "localhost_inquiry", event: "delivery_success", recordedAt: time, inquiryId, reviewOwner: "eric-yao", email: "PRIVATE EMAIL", shortNote: "PRIVATE NOTE" });
    assert.equal(run(["import"], log).status, 0);
    assert.equal(JSON.parse(run(["import"], log).stdout).importedOrUpdated, 0);
    assert.equal(run(["reply", inquiryId, time]).status, 1);
    assert.equal(run(["receive", inquiryId, time]).status, 0);
    assert.equal(run(["reply", inquiryId, time]).status, 0);
    const listed = JSON.parse(run(["list"]).stdout);
    assert.equal(listed[0].status, "replied");
    assert.equal(listed[0].owner, "eric-yao");
    assert.equal(run(["close", inquiryId]).status, 0);
    const report = JSON.parse(run(["report"]).stdout);
    assert.equal(report.confirmedDirectDeliveryRate, 1);
    assert.equal(report.substantiveReplyWithinTargetRate, 1);
    assert.equal(readFileSync(file, "utf8").includes("PRIVATE"), false);
    assert.equal(statSync(file).mode & 0o777, 0o600);
    const otherId = "LH-2026-11-02-1234ABCE";
    assert.equal(run(["import"], JSON.stringify({ ...JSON.parse(log), inquiryId: otherId, reviewOwner: undefined })).status, 0);
    assert.equal(run(["receive", otherId, time]).status, 0);
    assert.equal(run(["assign", otherId, "reviewer-2"]).status, 0);
    assert.equal(run(["reply", otherId, time]).status, 1, "A past reply before assignment must not be silently recorded as successful");
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
