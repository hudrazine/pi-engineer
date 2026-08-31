import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifySignature } from "../src/signature.js";

test("verifies an HMAC signature", () => {
  const body = '{"type":"created"}';
  const signature = createHmac("sha256", "secret").update(body).digest("hex");
  assert.equal(verifySignature("secret", body, signature), true);
  assert.equal(verifySignature("secret", body, "00"), false);
});
