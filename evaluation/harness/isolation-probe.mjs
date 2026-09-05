import net from "node:net";
import { access, readFile, readdir } from "node:fs/promises";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function canReachInternet() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "1.1.1.1", port: 443 });
    const finish = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(250, () => finish(false));
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
  });
}

const forbiddenHostRepository = (await readFile("/runtime/forbidden-host-path.txt", "utf8")).trim();
const processStatus = await readFile("/proc/self/status", "utf8");
const processCommandLines = [];
for (const entry of await readdir("/proc")) {
  if (!/^\d+$/.test(entry)) continue;
  try {
    processCommandLines.push(
      (await readFile(`/proc/${entry}/cmdline`)).toString().replaceAll("\0", " "),
    );
  } catch {}
}
const result = {
  workspace: await exists("/workspace"),
  packageExtension: await exists("/runtime/pi-engineer/src/index.ts"),
  agentModels: JSON.parse(await readFile("/agent/models.json", "utf8")),
  hostRepositoryVisible: await exists(forbiddenHostRepository),
  hostAuthVisible: await exists("/home/hudrazine/.pi/agent/auth.json"),
  hostTemporaryMarkerVisible: await exists("/tmp/pi-engineer-host-marker"),
  credentialNames: Object.keys(process.env).filter(
    (name) => name.includes("API_KEY") || name.includes("TOKEN") || name.includes("CREDENTIAL"),
  ),
  effectiveCapabilities: processStatus.match(/^CapEff:\s*(\S+)/m)?.[1],
  hostPathInProcessList: processCommandLines.some((value) =>
    value.includes(forbiddenHostRepository),
  ),
  internetReachable: await canReachInternet(),
};
process.stdout.write(`${JSON.stringify(result)}\n`);
