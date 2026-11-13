import { constants } from "node:fs";
import { mkdir, open, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { setTimeout as delay } from "node:timers/promises";
import { parseArgs } from "node:util";
import { importReviewLog, readReviewEvent, reviewOwner, reviewQueue, reviewReport, reviewTime } from "../lib/inquiryOperations.ts";

const file = resolve(process.env.LOCALHOST_REVIEW_LEDGER || ".local/inquiry-reviews.jsonl");
const holidays = (process.env.LOCALHOST_REVIEW_HOLIDAYS || "").split(",").map((item) => item.trim()).filter(Boolean);
const usage = "Usage: inquiry:reviews import | list [--open] | report [--as-of ISO_TIME] | assign REF OWNER_ALIAS [ISO_TIME] | receive REF [ISO_TIME] [--channel provider|manual] | reply REF [ISO_TIME] | close REF [ISO_TIME]";
const updateEvents = { assign: "assigned", receive: "inbox_received", reply: "replied", close: "closed" };

class ReviewCommandError extends Error {}

function readOptions() {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: { channel: { type: "string" }, "as-of": { type: "string" }, open: { type: "boolean" } }
    });
  } catch {
    throw new ReviewCommandError(usage);
  }
  const { values, positionals } = parsed;
  const [command, inquiryId, argument, assignmentTime] = positionals;
  const updates = Object.hasOwn(updateEvents, command);
  if ((!updates && !["import", "list", "report"].includes(command)) ||
      (updates && !inquiryId) || positionals.length > (command === "assign" ? 4 : updates ? 3 : 1) ||
      (values.channel !== undefined && (command !== "receive" || !["provider", "manual"].includes(values.channel))) ||
      (values.open && command !== "list") ||
      (values["as-of"] !== undefined && command !== "report")) {
    throw new ReviewCommandError(usage);
  }
  return { command, inquiryId, argument, assignmentTime, channel: values.channel, asOf: values["as-of"], openOnly: values.open };
}

function commandTime(value, now) {
  const time = reviewTime(value);
  if (!time || Date.parse(time) > Date.parse(now)) {
    throw new ReviewCommandError("Invalid timestamp. Use an ISO date-time with a timezone, no later than now.");
  }
  return time;
}

function eventsThrough(events, time) {
  const cutoff = Date.parse(time);
  return events.filter((event) => Date.parse(event.at) <= cutoff);
}

function listReviews(events, now, openOnly) {
  const rows = reviewQueue(eventsThrough(events, now), holidays);
  if (!openOnly) return rows;
  const cutoff = Date.parse(now);
  return rows.filter((row) => !row.closed).map((row) => {
    const pendingReply = Boolean(row.dueAt && !row.repliedAt);
    const replyOverdue = pendingReply && Date.parse(row.dueAt) <= cutoff;
    let priority = 4;
    if (replyOverdue) priority = 0;
    else if (row.status === "delivery_unconfigured") priority = 1;
    else if (pendingReply) priority = 2;
    else if (row.status === "awaiting_inbox") priority = 3;
    return { row: { ...row, replyOverdue }, priority };
  }).sort((a, b) => a.priority - b.priority ||
    (a.row.dueAt || "").localeCompare(b.row.dueAt || "") || a.row.inquiryId.localeCompare(b.row.inquiryId)
  ).map(({ row }) => row);
}

function manualUpdate(events, options, now) {
  const { command, inquiryId, argument, assignmentTime, channel } = options;
  const current = eventsThrough(events, now);
  const row = reviewQueue(current, holidays).find((item) => item.inquiryId === inquiryId);
  if (!row) throw new ReviewCommandError("Import this inquiry reference before updating it.");
  const suppliedTime = command === "assign" ? assignmentTime : argument;
  const recordedTime = command === "receive" ? row.receivedAt : command === "reply" ? row.repliedAt : undefined;
  const event = readReviewEvent({
    inquiryId,
    at: suppliedTime === undefined ? recordedTime || now : commandTime(suppliedTime, now),
    event: updateEvents[command],
    owner: command === "assign" ? reviewOwner(argument) : undefined,
    receiptChannel: channel
  });
  if (!event) throw new ReviewCommandError("Invalid review update or owner alias.");
  if (row.closed) {
    if (command === "close" && (suppliedTime === undefined || current.some((item) => JSON.stringify(item) === JSON.stringify(event)))) return [];
    throw new ReviewCommandError("This review is already closed. No update was recorded.");
  }
  if (command === "receive") {
    if (channel === "provider" && !row.providerAccepted) {
      throw new ReviewCommandError("Import matching provider acceptance before marking a direct inbox receipt.");
    }
    if (row.receivedAt) {
      if (event.at !== row.receivedAt || (row.receiptChannel && channel && row.receiptChannel !== channel)) {
        throw new ReviewCommandError("The first inbox receipt is already recorded. Its time and known channel cannot be replaced.");
      }
      if (!channel || row.receiptChannel === channel) return [];
    }
  }
  if (command === "reply") {
    if (row.repliedAt) {
      if (row.repliedAt === event.at) return [];
      throw new ReviewCommandError("The first substantive reply is already recorded.");
    }
    const historical = reviewQueue(eventsThrough(current, event.at), holidays)
      .find((item) => item.inquiryId === inquiryId);
    if (!historical?.receivedAt || !historical.owner || historical.closed) {
      throw new ReviewCommandError("Confirm inbox receipt and reviewer assignment before the recorded reply time.");
    }
  }
  if (command === "close" && [row.receivedAt, row.repliedAt].some((time) => time && Date.parse(time) > Date.parse(event.at))) {
    throw new ReviewCommandError("Closure cannot precede recorded receipt or reply.");
  }
  return current.some((item) => JSON.stringify(item) === JSON.stringify(event)) ? [] : [event];
}

async function readImport() {
  const incoming = new Map();
  for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
    try {
      const event = importReviewLog(JSON.parse(line));
      if (event) incoming.set(JSON.stringify(event), event);
    } catch { /* Ignore lines other than supported structured logs. */ }
  }
  return incoming;
}

async function withLedgerLock(run) {
  await mkdir(dirname(file), { recursive: true, mode: 0o700 });
  const lock = `${file}.lock`;
  const deadline = performance.now() + 2000;
  let handle;
  while (!handle) {
    try {
      handle = await open(lock, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (performance.now() >= deadline) {
        throw new ReviewCommandError("Private review ledger is busy. Retry after the other command finishes.");
      }
      await delay(35);
    }
  }
  try {
    await handle.writeFile(`${process.pid}\n`);
    return await run();
  } finally {
    try { await handle.close(); } finally { await unlink(lock); }
  }
}

async function openLedger(flags) {
  const handle = await open(file, flags | constants.O_NOFOLLOW | constants.O_NONBLOCK, 0o600);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.nlink !== 1 || (stat.mode & 0o077) || (process.getuid && stat.uid !== process.getuid())) {
      throw new ReviewCommandError("Use a private, owner-only regular file for the review ledger.");
    }
    return handle;
  } catch (error) {
    await handle.close();
    throw error;
  }
}

async function processLedger(options, incoming) {
  const { command } = options;
  const now = new Date().toISOString();
  const asOf = options.asOf === undefined ? now : commandTime(options.asOf, now);
  const readOnly = command === "list" || command === "report";
  let ledger;
  try {
    try { ledger = await openLedger(readOnly ? constants.O_RDONLY : constants.O_RDWR | constants.O_APPEND); }
    catch (error) { if (error.code !== "ENOENT") throw error; }

    const source = ledger ? await ledger.readFile("utf8") : "";
    const events = source.split("\n").filter((line) => line.trim()).map((line) => {
      const event = readReviewEvent(JSON.parse(line));
      if (!event) throw new Error("Invalid private ledger record.");
      return event;
    });
    let additions = [];
    if (command === "import") {
      const seen = new Set(events.map((row) => JSON.stringify(row)));
      additions = [...incoming].filter(([key]) => !seen.has(key)).map(([, event]) => event);
    } else if (Object.hasOwn(updateEvents, command)) {
      additions = manualUpdate(events, options, now);
    }
    if (additions.length) {
      ledger ??= await openLedger(constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL);
      const separator = source && !source.endsWith("\n") ? "\n" : "";
      await ledger.writeFile(separator + additions.map((row) => JSON.stringify(row)).join("\n") + "\n");
      await ledger.sync();
    }
    const all = [...events, ...additions];
    return command === "list" ? listReviews(all, now, options.openOnly) : { importedOrUpdated: additions.length, ...reviewReport(all, asOf, holidays) };
  } finally {
    await ledger?.close();
  }
}

try {
  const options = readOptions();
  // A slow stdin producer must not hold the ledger lock.
  const incoming = options.command === "import" ? await readImport() : undefined;
  const result = await withLedgerLock(() => processLedger(options, incoming));
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof ReviewCommandError ? error.message : "Private review ledger could not be processed. No inquiry content has been printed.");
  process.exitCode = 1;
}
