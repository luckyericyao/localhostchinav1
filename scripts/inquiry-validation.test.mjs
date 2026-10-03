import assert from "node:assert/strict";
import test from "node:test";
import { inquiryTextLimits, readInquiryFields } from "../lib/inquiryValidation.ts";

const valid = { name: "Traveler", email: "traveler@example.test", shortNote: "Timber temples and regional food." };

test("normalization trims without removing meaningful content", () => {
  const result = readInquiryFields({
    name: " Traveler ", email: " Traveler@Example.Test ", shortNote: " A slower route. ",
    optionalDetails: { " foodPreferences ": " Vegetarian meals. ", unused: " " }
  });
  assert.deepEqual(result, { ok: true, value: {
    name: "Traveler", email: "traveler@example.test", shortNote: "A slower route.",
    optionalDetails: { foodPreferences: "Vegetarian meals." }
  } });
});

test("all text boundaries accept the exact limit and reject an extra character", () => {
  const emailAtLimit = `${"e".repeat(inquiryTextLimits.email - 13)}@example.test`;
  for (const [field, value] of [
    ["name", "N".repeat(inquiryTextLimits.name)],
    ["email", emailAtLimit],
    ["shortNote", "N".repeat(inquiryTextLimits.shortNote)]
  ]) {
    assert.equal(readInquiryFields({ ...valid, [field]: value }).ok, true);
    const tooLong = readInquiryFields({ ...valid, [field]: value + "Z" });
    assert.equal(tooLong.ok, false);
    assert.equal(tooLong.error.field, field);
  }
  const detail = "D".repeat(inquiryTextLimits.detail);
  assert.equal(readInquiryFields({ ...valid, optionalDetails: { food: detail } }).ok, true);
  const tooLong = readInquiryFields({ ...valid, optionalDetails: { food: detail + "Z" } });
  assert.equal(tooLong.ok, false);
  assert.equal(tooLong.error.detailKey, "food");
});

test("required and malformed fields produce the matching field error", () => {
  for (const [field, value] of [["name", " "], ["email", "invalid"], ["shortNote", null]]) {
    const result = readInquiryFields({ ...valid, [field]: value });
    assert.equal(result.ok, false);
    assert.equal(result.error.field, field);
  }
});

test("additional fields are never silently dropped to fit the collection limit", () => {
  const details = Object.fromEntries(Array.from({ length: 32 }, (_, i) => [`detail${i}`, `value${i}`]));
  const atLimit = readInquiryFields({ ...valid, optionalDetails: details });
  assert.equal(atLimit.ok, true);
  assert.equal(Object.keys(atLimit.value.optionalDetails).length, 32);
  assert.equal(readInquiryFields({ ...valid, optionalDetails: { ...details, extra: "value" } }).ok, false);
});

test("ambiguous labels and malformed detail values reject the whole submission", () => {
  for (const optionalDetails of [
    { food: "one", " food ": "two" }, { ["k".repeat(81)]: "value" },
    { food: 42 }, ["unlabeled"], "unlabeled"
  ]) {
    const result = readInquiryFields({ ...valid, optionalDetails });
    assert.equal(result.ok, false);
    assert.equal(result.error.field, "details");
  }
});

test("inquiry preparation leaves the original input object unchanged", () => {
  const original = { ...valid, optionalDetails: { food: " Full original text. " } };
  const snapshot = structuredClone(original);
  readInquiryFields(original);
  assert.deepEqual(original, snapshot);
});
