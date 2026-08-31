import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { acceptWebhook } from "../src/webhook.js";

function sign(secret, body) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

test("accepts only signed JSON webhook bodies", () => {
  const rawBody = '{"type":"created","id":"evt-1"}';
  assert.deepEqual(
    acceptWebhook({ secret: "secret", rawBody, signature: sign("secret", rawBody) }),
    { type: "created", id: "evt-1" },
  );
  assert.throws(() => acceptWebhook({ secret: "secret", rawBody, signature: "00" }), /signature/i);

  const malformed = "not-json";
  assert.throws(() =>
    acceptWebhook({ secret: "secret", rawBody: malformed, signature: sign("secret", malformed) }),
  );
});
