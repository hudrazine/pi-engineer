import { verifySignature } from "./signature.js";

export function acceptWebhook({ secret, rawBody, signature }) {
  if (!verifySignature(secret, rawBody, signature)) {
    throw new Error("invalid webhook signature");
  }
  return JSON.parse(rawBody);
}
