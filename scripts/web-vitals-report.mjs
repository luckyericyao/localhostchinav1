import { createInterface } from "node:readline";
import { buildWebVitalsReport } from "./lib/web-vitals-report.mjs";

const lines = [];
for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) lines.push(line);
console.log(JSON.stringify(buildWebVitalsReport(lines), null, 2));
