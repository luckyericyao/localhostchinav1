import { createInterface } from "node:readline";
import { buildFunnelReport } from "./lib/funnel-report.mjs";

const lines = [];
for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) lines.push(line);
console.log(JSON.stringify(buildFunnelReport(lines), null, 2));
