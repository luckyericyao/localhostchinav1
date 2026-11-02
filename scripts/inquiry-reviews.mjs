import { constants } from "node:fs";
import { mkdir, readFile, open } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { importReviewLog, readReviewEvent, reviewOwner, reviewQueue, reviewReport } from "../lib/inquiryOperations.ts";

const file = resolve(process.env.LOCALHOST_REVIEW_LEDGER || ".local/inquiry-reviews.jsonl");
const holidays = (process.env.LOCALHOST_REVIEW_HOLIDAYS || "").split(",").map((item) => item.trim()).filter(Boolean);
const [command, inquiryId, argument] = process.argv.slice(2);

try {
  let source = "";
  try { source = await readFile(file, "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const events = source.split("\n").filter(Boolean).map((line) => {
    const event = readReviewEvent(JSON.parse(line));
    if (!event) throw new Error("Invalid private ledger record.");
    return event;
  });
  const additions = [];
  if (command === "import") {
    let input = "";
    for await (const chunk of process.stdin) input += chunk;
    const seen = new Set(events.map((row) => JSON.stringify(row)));
    for (const line of input.split("\n").filter(Boolean)) {
      let event;
      try { event = importReviewLog(JSON.parse(line)); } catch { continue; }
      if (event && !seen.has(JSON.stringify(event))) { additions.push(event); seen.add(JSON.stringify(event)); }
    }
  } else if (["assign", "receive", "reply", "close"].includes(command)) {
    const row = reviewQueue(events, holidays).find((item) => item.inquiryId === inquiryId);
    if (!row) throw new Error("Import this inquiry reference before updating it.");
    if (command === "reply" && (!row.receivedAt || !row.owner)) throw new Error("Confirm inbox receipt and assign an owner before recording a substantive reply.");
    const event = readReviewEvent({ inquiryId, at: command === "assign" ? new Date().toISOString() : argument || new Date().toISOString(), event: { assign: "assigned", receive: "inbox_received", reply: "replied", close: "closed" }[command], owner: command === "assign" ? reviewOwner(argument) : undefined });
    if (!event || Date.parse(event.at) > Date.now() + 60_000 || (command === "reply" && Date.parse(event.at) < Date.parse(row.receivedAt))) throw new Error("Invalid update, owner alias, or timestamp.");
    if (command === "reply" && !reviewQueue([...events, event], holidays).find((item) => item.inquiryId === inquiryId)?.repliedAt) throw new Error("Invalid reply chronology: the reviewer must be assigned before the recorded reply time.");
    additions.push(event);
  } else if (!["list", "report"].includes(command)) {
    throw new Error("Usage: inquiry:reviews import | list | report | assign REF OWNER_ALIAS | receive REF [ISO_TIME] | reply REF [ISO_TIME] | close REF [ISO_TIME]");
  }
  if (additions.length) {
    await mkdir(dirname(file), { recursive: true, mode: 0o700 });
    const handle = await open(file, constants.O_WRONLY | constants.O_CREAT | constants.O_APPEND | constants.O_NOFOLLOW, 0o600);
    try { await handle.chmod(0o600); await handle.writeFile(additions.map((row) => JSON.stringify(row)).join("\n") + "\n"); } finally { await handle.close(); }
  }
  const all = [...events, ...additions];
  console.log(JSON.stringify(command === "list" ? reviewQueue(all, holidays) : { importedOrUpdated: additions.length, ...reviewReport(all, undefined, holidays) }, null, 2));
} catch (error) {
  console.error(error instanceof Error && /^(Usage:|Import this|Confirm inbox|Invalid)/.test(error.message) ? error.message : "Private review ledger could not be processed. No inquiry content has been printed.");
  process.exitCode = 1;
}
