import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { routePhotography } from "../lib/routePhotography.ts";
import { serviceLevels } from "../lib/serviceScope.ts";

const compiled = ts.transpileModule(readFileSync(new URL("../lib/content.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
vm.runInNewContext(compiled, { exports, require: (name) => { assert.equal(name, "@/lib/routePhotography"); return { routePhotography }; } });

test("each current route has three real-place photographs, attribution, and one four-part example day", () => {
  const names = { shanxi: ["Yungang", "Yingxian", "Jinci"], shaolin: ["Shaolin", "Pagoda Forest", "Songyang"], huizhou: ["Hongcun", "Xidi", "Huangshan"], shanghai: ["Bund", "Wukang", "Yu Garden"] };
  for (const [key, anchors] of Object.entries(names)) {
    const route = exports.chinaRoutePages[key];
    assert.equal(route.gallery.images.length, 3);
    assert.equal(route.sampleDay.length, 4);
    const titles = route.gallery.images.map((item) => item.title).join(" ");
    for (const anchor of anchors) assert.ok(titles.includes(anchor), `${key}: missing ${anchor}`);
    for (const image of route.gallery.images) {
      const bytes = readFileSync(new URL(`../public${image.src}`, import.meta.url));
      assert.equal(bytes[0], 0xff);
      assert.equal(bytes[1], 0xd8);
      assert.ok(bytes.length > 40_000);
      assert.ok(image.credit.author);
      assert.equal(new URL(image.credit.source).hostname, "commons.wikimedia.org");
      assert.ok(image.credit.licenseUrl.startsWith("https://"));
    }
  }
});

test("the same three service levels have explicit presence, preparation, and support boundaries", () => {
  assert.equal(serviceLevels.length, 3);
  for (const level of serviceLevels) {
    for (const key of ["summary", "presence", "preparation", "support"]) assert.ok(level[key].length > 30);
  }
  assert.match(serviceLevels[2].support, /not 24\/7/);
});
