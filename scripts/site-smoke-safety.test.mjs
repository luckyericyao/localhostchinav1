import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const script = fileURLToPath(new URL("./site-smoke.mjs", import.meta.url));
const capture = `globalThis.fetch = async (url, options) => {
  const method = options.method ?? "GET";
  console.log("REQUEST " + JSON.stringify({ url, method, redirect: options.redirect }));
  return new Response(null, {
    status: 308, headers: { location: "https://other.example/" }
  });
};`;
const preload = `data:text/javascript,${encodeURIComponent(capture)}`;

for (const [site, flag, expectedPosts] of [
  ["https://localhostglobal.vercel.app", "0", 0],
  ["http://localhost.example:3118", "0", 0],
  ["http://127.0.0.1:3118", "1", 0],
  ["http://127.0.0.1:3118", "0", 6]
]) {
  test(`smoke requests stay on ${site} (read-only flag: ${flag})`, () => {
    const result = spawnSync(process.execPath, ["--import", preload, script], {
      encoding: "utf8",
      env: { SITE_URL: site, SMOKE_READ_ONLY: flag },
      timeout: 5000
    });

    assert.equal(result.status, 1, result.error?.message);
    assert.match(result.stderr, /FAIL \/: HTTP 308/);
    const requests = result.stdout.split("\n").filter((line) => line.startsWith("REQUEST "))
      .map((line) => JSON.parse(line.slice("REQUEST ".length)));
    assert.ok(requests.length >= 20);
    assert.ok(requests.every(({ url, redirect }) => new URL(url).origin === site && redirect === "manual"));
    const posts = requests.filter(({ method }) => method === "POST");
    assert.equal(posts.length, expectedPosts);
    assert.ok(posts.every(({ url }) => new URL(url).pathname === "/api/analytics"));
  });
}
