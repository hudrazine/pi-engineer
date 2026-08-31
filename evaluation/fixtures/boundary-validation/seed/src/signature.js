import { createHmac, timingSafeEqual } from "node:crypto";

export function verifySignature(secret, rawBody, providedSignature) {
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const provided = Buffer.from(providedSignature, "hex");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
