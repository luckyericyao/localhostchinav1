import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.mjs";

test("release headers expose only a valid full Git revision", async () => {
  const key = "VERCEL_GIT_COMMIT_SHA";
  const original = process.env[key];
  const sha = "0123456789abcdef0123456789abcdef01234567";

  try {
    process.env[key] = sha;
    assert.deepEqual(await nextConfig.headers(), [{
      source: "/:path*",
      headers: [{ key: "X-Localhost-Revision", value: sha }]
    }]);

    for (const invalid of [undefined, "", sha.slice(0, 7), "g".repeat(40), `${sha.slice(0, 39)}\n`]) {
      if (invalid === undefined) delete process.env[key];
      else process.env[key] = invalid;
      assert.deepEqual(await nextConfig.headers(), []);
    }
  } finally {
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  }
});
