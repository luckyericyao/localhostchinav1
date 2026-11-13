import assert from "node:assert/strict";
import test from "node:test";
import { chmodSync, existsSync, linkSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { publicOperator } from "../lib/operator.ts";
import { importReviewLog, readReviewEvent, replyDueAt, reviewOwner, reviewQueue, reviewReport, reviewTime } from "../lib/inquiryOperations.ts";

const inquiryId = "LH-2026-11-02-1234ABCD";
const at = "2026-11-02T03:00:00.000Z";

function ledgerFixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "localhost-review-test-"));
  const file = join(directory, "ledger.jsonl");
  const env = { LOCALHOST_REVIEW_LEDGER: file, LOCALHOST_REVIEW_HOLIDAYS: "" };
  const args = ["--experimental-strip-types", fileURLToPath(new URL("./inquiry-reviews.mjs", import.meta.url))];
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return {
    directory, file, env, args,
    run: (options, input) => spawnSync(process.execPath, [...args, ...options], { encoding: "utf8", input, env, timeout: 8000 })
  };
}

function runConcurrentImport(args, env, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [...args, "import"], { env, timeout: 8000 });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.stdin.once("error", reject);
    child.once("close", (status) => resolve({ status, stdout, stderr }));
    child.stdin.end(input);
  });
}

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
  assert.equal(readReviewEvent({ event: "inbox_received", at, inquiryId, receiptChannel: "untrusted" }), null);
});

test("review timestamps require a real calendar date and explicit timezone", () => {
  assert.equal(reviewTime("2026-11-02T11:00:00+08:00"), at);
  assert.equal(reviewTime("2026-11-02T03:00:00"), undefined);
  assert.equal(reviewTime("2026-02-30T03:00:00Z"), undefined);
  assert.equal(reviewTime("2026-11-02T24:00:00Z"), undefined);
  assert.equal(reviewTime("9999-12-31T23:59:59-01:00"), undefined);
  assert.throws(() => reviewReport([], "2026-11-02"), /Invalid report timestamp/);
});

test("provider acceptance, inbox receipt and substantive reply remain separate", () => {
  const accepted = { event: "provider_accepted", at, inquiryId, owner: "china-review" };
  const before = reviewReport([accepted], "2026-11-10T03:00:00Z");
  assert.equal(before.providerAcceptanceRate, 1);
  assert.equal(before.confirmedDirectDeliveryRate, 0);
  assert.equal(before.substantiveReplyWithinTargetRate, null);
  const events = [accepted, { event: "inbox_received", at, inquiryId, receiptChannel: "provider" }, { event: "replied", at: "2026-11-03T03:00:00Z", inquiryId }];
  const after = reviewReport(events, "2026-11-10T03:00:00Z");
  assert.equal(after.confirmedDirectDeliveryRate, 1);
  assert.equal(after.substantiveReplyWithinTargetRate, 1);
  assert.equal(after.replySampleSize, 1);
});

test("only explicit matching provider receipt evidence counts as direct delivery", () => {
  const accepted = { event: "provider_accepted", at, inquiryId, owner: "china-review" };
  const receipt = { event: "inbox_received", at, inquiryId };
  const unknown = reviewReport([accepted, receipt], at);
  assert.equal(unknown.inboxConfirmed, 1);
  assert.equal(unknown.directInboxConfirmed, 0);
  assert.equal(unknown.inboxChannelUnverified, 1);
  assert.equal(unknown.confirmedDirectDeliveryRate, 0);

  const manual = reviewReport([accepted, { ...receipt, receiptChannel: "manual" }], at);
  assert.equal(manual.manualInboxConfirmed, 1);
  assert.equal(manual.confirmedDirectDeliveryRate, 0);
  assert.equal(manual.inboxChannelUnverified, 0);

  const providerReceipt = { ...receipt, receiptChannel: "provider" };
  assert.equal(reviewReport([providerReceipt], at).directInboxConfirmed, 0);
  assert.equal(reviewReport([accepted, receipt, providerReceipt], at).directInboxConfirmed, 1);
});

test("historical reports exclude future references, inbox receipts, and replies", () => {
  const accepted = { event: "provider_accepted", at, inquiryId, owner: "reviewer" };
  const events = [accepted,
    { event: "inbox_received", at: "2026-11-02T04:00:00.000Z", inquiryId, receiptChannel: "provider" },
    { event: "replied", at: "2026-11-03T03:00:00.000Z", inquiryId },
    { ...accepted, at: "2026-11-03T03:00:00.000Z", inquiryId: "LH-2026-11-03-1111AAAA" }
  ];
  const beforeReceipt = reviewReport(events, at);
  assert.equal(beforeReceipt.validReferences, 1);
  assert.equal(beforeReceipt.inboxConfirmed, 0);
  assert.equal(beforeReceipt.substantiveReplyWithinTargetRate, null);
  const beforeReply = reviewReport(events, "2026-11-02T11:00:00Z");
  assert.equal(beforeReply.directInboxConfirmed, 1);
  assert.equal(beforeReply.replySampleSize, 0);
  assert.equal(beforeReply.awaitingReplyWithinWindow, 1);
});

test("later delivery hints cannot replace an assigned reviewer or reopen a closed review", () => {
  const events = [
    { event: "provider_accepted", at, inquiryId, owner: "initial-default" },
    { event: "inbox_received", at, inquiryId, receiptChannel: "manual" },
    { event: "assigned", at: "2026-11-02T04:00:00.000Z", inquiryId, owner: "assigned-reviewer" },
    { event: "email_draft", at: "2026-11-02T05:00:00.000Z", inquiryId, owner: "new-default" },
    { event: "closed", at: "2026-11-02T06:00:00.000Z", inquiryId },
    { event: "replied", at: "2026-11-02T07:00:00.000Z", inquiryId }
  ];
  const row = reviewQueue(events)[0];
  assert.equal(row.owner, "assigned-reviewer");
  assert.equal(row.status, "closed");
  assert.equal(row.repliedAt, undefined);
  assert.equal(reviewReport(events, "2026-11-02T08:00:00Z").awaitingReplyWithinWindow, 0);
  assert.equal(reviewReport(events, "2026-11-05T08:00:00Z").substantiveReplyWithinTargetRate, 0);
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

test("private ledger CLI imports idempotently, records the review lifecycle, and never retains traveler content", (t) => {
  const { file, run } = ledgerFixture(t);
  const time = new Date(Date.now() - 8 * 86400000).toISOString();
  const log = JSON.stringify({ kind: "localhost_inquiry", event: "delivery_success", recordedAt: time, inquiryId, reviewOwner: "eric-yao", email: "PRIVATE EMAIL", shortNote: "PRIVATE NOTE" });
  assert.equal(run(["import"], log).status, 0);
  assert.equal(JSON.parse(run(["import"], log).stdout).importedOrUpdated, 0);
  assert.equal(run(["reply", inquiryId, time]).status, 1);
  assert.equal(run(["receive", inquiryId, time, "--channel", "provider"]).status, 0);
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
});

test("CLI reports actual event-time snapshots and keeps receipt and reply facts immutable", (t) => {
  const { file, run } = ledgerFixture(t);
  const start = Date.now() - 8 * 86400000;
  const acceptedAt = new Date(start).toISOString();
  const receiptAt = new Date(start + 3600000).toISOString();
  const assignmentAt = new Date(start + 2 * 3600000).toISOString();
  const replyAt = new Date(start + 3 * 3600000).toISOString();
  const log = JSON.stringify({ kind: "localhost_inquiry", event: "delivery_success", recordedAt: acceptedAt, inquiryId });
  assert.equal(run(["import"], log).status, 0);
  assert.equal(run(["receive", inquiryId, receiptAt, "--channel", "manual"]).status, 0);
  assert.equal(run(["assign", inquiryId, "rehearsal-reviewer", assignmentAt]).status, 0);
  assert.equal(run(["reply", inquiryId, receiptAt]).status, 1);
  assert.equal(run(["reply", inquiryId, replyAt]).status, 0);
  const beforeInvalidUpdates = readFileSync(file, "utf8");
  assert.equal(run(["reply", inquiryId, receiptAt]).status, 1);
  assert.equal(run(["close", inquiryId, assignmentAt]).status, 1);
  assert.equal(run(["receive", inquiryId, receiptAt, "--channel", "provider"]).status, 1);
  assert.equal(JSON.parse(run(["receive", inquiryId]).stdout).importedOrUpdated, 0);
  assert.equal(JSON.parse(run(["reply", inquiryId]).stdout).importedOrUpdated, 0);
  assert.equal(readFileSync(file, "utf8"), beforeInvalidUpdates);
  const beforeReceipt = JSON.parse(run(["report", "--as-of", acceptedAt]).stdout);
  assert.equal(beforeReceipt.asOf, acceptedAt);
  assert.equal(beforeReceipt.inboxConfirmed, 0);
  assert.equal(beforeReceipt.substantiveReplyWithinTargetRate, null);
  const current = JSON.parse(run(["report"]).stdout);
  assert.equal(current.providerAccepted, 1);
  assert.equal(current.manualInboxConfirmed, 1);
  assert.equal(current.confirmedDirectDeliveryRate, 0);
  assert.equal(current.substantiveReplyWithinTargetRate, 1);
  assert.equal(run(["close", inquiryId]).status, 0);
  assert.equal(run(["assign", inquiryId, "different-reviewer"]).status, 1);
  assert.equal(JSON.parse(run(["close", inquiryId]).stdout).importedOrUpdated, 0);
});

test("concurrent overlapping imports append each canonical metadata record only once", async (t) => {
  const { file, args, env } = ledgerFixture(t);
  const rows = Array.from({ length: 12 }, (_, index) => ({
    kind: "localhost_inquiry",
    event: "delivery_success",
    recordedAt: at,
    inquiryId: `LH-2026-11-02-${index.toString(16).toUpperCase().padStart(8, "0")}`,
    reviewOwner: "synthetic-reviewer",
    shortNote: "SYNTHETIC_PRIVATE_NOTE"
  }));
  const results = await Promise.all(Array.from({ length: 8 }, (_, index) => {
    const shared = rows.slice(index, index + 5);
    const wrapped = { message: JSON.stringify({ ...shared[0], recordedAt: "2026-11-02T11:00:00+08:00" }) };
    return runConcurrentImport(args, env, [...shared, wrapped].map((row) => JSON.stringify(row)).join("\r\n"));
  }));
  const total = results.reduce((count, result) => {
    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stdout + result.stderr, /SYNTHETIC_PRIVATE_NOTE/);
    return count + JSON.parse(result.stdout).importedOrUpdated;
  }, 0);
  assert.equal(total, 12);
  const ledger = readFileSync(file, "utf8");
  assert.doesNotMatch(ledger, /SYNTHETIC_PRIVATE_NOTE/);
  assert.equal(ledger.trim().split("\n").length, 12);
  assert.equal(new Set(ledger.trim().split("\n").map((line) => JSON.parse(line).inquiryId)).size, 12);
  assert.equal(statSync(file).mode & 0o777, 0o600);
  assert.equal(existsSync(`${file}.lock`), false);
});

test("unsafe or corrupt ledger files fail without disclosing contents or altering the target", async (t) => {
  const source = JSON.stringify({ event: "provider_accepted", at, inquiryId, shortNote: "SYNTHETIC_PRIVATE_NOTE" }) + "\n";
  const imported = JSON.stringify({ kind: "localhost_inquiry", event: "delivery_fallback", recordedAt: at, inquiryId });
  for (const [name, makeLink] of [["symbolic link", symlinkSync], ["hard link", linkSync]]) {
    await t.test(name, (subtest) => {
      const { file, directory, run } = ledgerFixture(subtest);
      const target = join(directory, "target.jsonl");
      writeFileSync(target, source, { mode: 0o600 });
      makeLink(target, file);
      const report = run(["report"]);
      const update = run(["import"], imported);
      for (const result of [report, update]) {
        assert.equal(result.status, 1);
        assert.equal(result.stdout, "");
        assert.doesNotMatch(result.stderr, /SYNTHETIC_PRIVATE_NOTE/);
      }
      assert.equal(readFileSync(target, "utf8"), source);
      assert.equal(existsSync(`${file}.lock`), false);
    });
  }
  await t.test("group-readable file", (subtest) => {
    const { file, run } = ledgerFixture(subtest);
    writeFileSync(file, source);
    chmodSync(file, 0o640);
    const report = run(["report"]);
    assert.equal(report.status, 1);
    assert.equal(report.stdout, "");
    assert.match(report.stderr, /owner-only/);
    assert.equal(statSync(file).mode & 0o777, 0o640);
    assert.equal(readFileSync(file, "utf8"), source);
  });
  await t.test("directory", (subtest) => {
    const { file, run } = ledgerFixture(subtest);
    mkdirSync(file, { mode: 0o700 });
    assert.equal(run(["list"]).status, 1);
    assert.equal(statSync(file).isDirectory(), true);
  });
  await t.test("corrupt record", (subtest) => {
    const { file, run } = ledgerFixture(subtest);
    const corrupt = source + "{ SYNTHETIC_PRIVATE_NOTE";
    writeFileSync(file, corrupt, { mode: 0o600 });
    const update = run(["import"], imported);
    assert.equal(update.status, 1);
    assert.equal(update.stdout, "");
    assert.doesNotMatch(update.stderr, /SYNTHETIC_PRIVATE_NOTE/);
    assert.equal(readFileSync(file, "utf8"), corrupt);
    assert.equal(existsSync(`${file}.lock`), false);
  });
});

test("a busy ledger has a bounded wait and cannot steal another command's lock", (t) => {
  const { file, run } = ledgerFixture(t);
  const lock = `${file}.lock`;
  writeFileSync(lock, "0\n", { mode: 0o600 });
  const result = run(["report"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ledger is busy/);
  assert.equal(readFileSync(lock, "utf8"), "0\n");
  assert.equal(existsSync(file), false);
});

test("legacy receipt evidence can be enriched without rewriting its timestamp or history", (t) => {
  const { file, run } = ledgerFixture(t);
  const original = JSON.stringify({ event: "inbox_received", at, inquiryId });
  writeFileSync(file, original, { mode: 0o600 });
  assert.equal(run(["receive", inquiryId, "--channel", "provider"]).status, 1);
  assert.equal(readFileSync(file, "utf8"), original);
  assert.equal(JSON.parse(run(["report"]).stdout).inboxChannelUnverified, 1);
  const confirmed = run(["receive", inquiryId, "--channel", "manual"]);
  assert.equal(confirmed.status, 0, confirmed.stderr);
  assert.equal(JSON.parse(confirmed.stdout).manualInboxConfirmed, 1);
  const stored = readFileSync(file, "utf8").trim().split("\n");
  assert.equal(stored[0], original);
  assert.equal(stored.length, 2);
  assert.equal(JSON.parse(stored[1]).at, at);
  assert.equal(JSON.parse(run(["receive", inquiryId, "--channel", "manual"]).stdout).importedOrUpdated, 0);
});

test("open review queue puts overdue and delivery-blocked inquiries first without hiding closed history", (t) => {
  const { file, run } = ledgerFixture(t);
  const now = Date.now();
  const ref = (index) => `LH-2026-11-02-${String(index).padStart(8, "0")}`;
  const entry = (index, event, hoursAgo, extra = {}) => ({
    inquiryId: ref(index), event, at: new Date(now - hoursAgo * 3600000).toISOString(), ...extra
  });
  const events = [
    entry(1, "provider_accepted", 14 * 24), entry(1, "inbox_received", 14 * 24), entry(1, "closed", 13 * 24),
    entry(2, "provider_accepted", 12 * 24, { owner: "synthetic-reviewer" }), entry(2, "inbox_received", 12 * 24), entry(2, "replied", 11 * 24),
    entry(3, "provider_accepted", 11 * 24),
    entry(4, "provider_accepted", 9 * 24), entry(4, "inbox_received", 9 * 24),
    entry(5, "provider_accepted", 7 * 24), entry(5, "inbox_received", 7 * 24),
    entry(6, "provider_accepted", 1), entry(6, "inbox_received", 1),
    entry(7, "delivery_unconfigured", 1)
  ];
  writeFileSync(file, events.map((row) => JSON.stringify(row)).join("\n") + "\n", { mode: 0o600 });
  const result = run(["list", "--open"]);
  assert.equal(result.status, 0, result.stderr);
  const queue = JSON.parse(result.stdout);
  assert.deepEqual(queue.map((row) => row.inquiryId), [4, 5, 7, 6, 3, 2].map(ref));
  assert.deepEqual(queue.map((row) => row.replyOverdue), [true, true, false, false, false, false]);
  assert.equal(JSON.parse(run(["list"]).stdout).find((row) => row.inquiryId === ref(1)).status, "closed");
  assert.equal(run(["report", "--open"]).status, 1);
});
