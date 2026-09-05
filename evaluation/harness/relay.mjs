import http from "node:http";
import { mkdir, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { canonicalJson, sha256 } from "./lib.mjs";

export function loadEvaluationCredential(environment = process.env) {
  const credential = environment.PI_ENGINEER_EVAL_OPENROUTER_API_KEY;
  if (!credential) throw new Error("PI_ENGINEER_EVAL_OPENROUTER_API_KEY is required");
  return credential;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 32 * 1024 * 1024) {
        reject(new Error("Relay request body exceeds 32 MiB"));
        request.destroy();
      } else chunks.push(chunk);
    });
    request.once("end", () => resolve(Buffer.concat(chunks)));
    request.once("error", reject);
  });
}

function textContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return undefined;
  const texts = content
    .filter((item) => item?.type === "text" && typeof item.text === "string")
    .map((item) => item.text);
  return texts.length > 0 ? texts.join("") : undefined;
}

export function extractSystemPrompt(body) {
  const systemMessages = Array.isArray(body.messages)
    ? body.messages
        .filter((message) => message?.role === "system" || message?.role === "developer")
        .map((message) => textContent(message.content))
        .filter(Boolean)
    : [];
  return systemMessages.length > 0 ? systemMessages.join("\n\n") : undefined;
}

export function validateRelayRequest({ method, path, body, model, requestNumber, requestLimit }) {
  const violations = [];
  if (method !== "POST") violations.push("method");
  if (path !== "/api/v1/chat/completions") violations.push("endpoint");
  if (requestNumber > requestLimit) violations.push("request-limit");
  if (body?.model !== model.id) violations.push("model-id");
  const routing = body?.provider;
  if (routing?.allow_fallbacks !== false) violations.push("fallbacks");
  if (canonicalJson(routing?.only) !== canonicalJson([model.upstream]))
    violations.push("provider-only");
  if (canonicalJson(routing?.order) !== canonicalJson([model.upstream]))
    violations.push("provider-order");
  const systemPrompt = extractSystemPrompt(body ?? {});
  if (!systemPrompt) violations.push("system-prompt");
  return {
    violations,
    systemPrompt,
    systemPromptHash: systemPrompt ? sha256(systemPrompt) : undefined,
  };
}

function sendJson(response, status, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, { "content-type": "application/json", "content-length": body.length });
  response.end(body);
}

export async function startRelay({ socketPath, model, requestLimit, openRouterUrl, credential }) {
  await mkdir(dirname(socketPath), { recursive: true, mode: 0o700 });
  await rm(socketPath, { force: true });
  const evidence = {
    accepted: [],
    rejected: [],
    systemPrompt: undefined,
    systemPromptHash: undefined,
  };
  let requestNumber = 0;
  const server = http.createServer((request, response) => {
    void (async () => {
      requestNumber += 1;
      try {
        const rawBody = await readBody(request);
        let body;
        try {
          body = JSON.parse(rawBody.toString("utf8"));
        } catch {
          body = undefined;
        }
        const validation = validateRelayRequest({
          method: request.method,
          path: request.url,
          body,
          model,
          requestNumber,
          requestLimit,
        });
        if (
          evidence.systemPromptHash &&
          validation.systemPromptHash &&
          evidence.systemPromptHash !== validation.systemPromptHash
        ) {
          validation.violations.push("system-prompt-drift");
        }
        const item = {
          requestNumber,
          method: request.method,
          path: request.url,
          model: body?.model,
          provider: body?.provider,
          systemPromptHash: validation.systemPromptHash,
          violations: validation.violations,
        };
        if (validation.violations.length > 0) {
          evidence.rejected.push(item);
          sendJson(response, 400, {
            error: {
              message: `Evaluation relay rejected request: ${validation.violations.join(", ")}`,
              type: "invalid_request_error",
            },
          });
          return;
        }
        if (!evidence.systemPromptHash) {
          evidence.systemPrompt = validation.systemPrompt;
          evidence.systemPromptHash = validation.systemPromptHash;
        }
        evidence.accepted.push(item);
        const upstream = await fetch(openRouterUrl, {
          method: "POST",
          headers: { authorization: `Bearer ${credential}`, "content-type": "application/json" },
          body: rawBody,
        });
        const responseBody = Buffer.from(await upstream.arrayBuffer());
        item.upstreamStatus = upstream.status;
        const headers = {};
        for (const [key, value] of upstream.headers) {
          if (
            !["content-encoding", "transfer-encoding", "connection", "content-length"].includes(
              key.toLowerCase(),
            )
          )
            headers[key] = value;
        }
        response.writeHead(upstream.status, { ...headers, "content-length": responseBody.length });
        response.end(responseBody);
      } catch (error) {
        evidence.rejected.push({
          requestNumber,
          violations: ["relay-error"],
          error: error.message,
        });
        if (!response.headersSent)
          sendJson(response, 502, {
            error: { message: "Evaluation relay failed", type: "relay_error" },
          });
        else response.destroy();
      }
    })();
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(socketPath, resolve);
  });
  return {
    evidence,
    async close() {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
      await rm(socketPath, { force: true });
    },
  };
}
