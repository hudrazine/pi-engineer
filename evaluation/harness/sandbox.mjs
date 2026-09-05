import { access, constants } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { repositoryRoot, sandboxEnvironment } from "./lib.mjs";
import { runProcess } from "./sandbox-process.mjs";

const nodeExecutable = process.execPath;
const pnpmRoot = join(repositoryRoot, "node_modules");
const networkBridge = fileURLToPath(new URL("./sandbox-network.mjs", import.meta.url));

export async function assertSandboxPrerequisites() {
  for (const executable of [
    "/usr/bin/bwrap",
    "/usr/bin/unshare",
    "/usr/sbin/ip",
    "/usr/bin/setpriv",
    "/bin/bash",
    nodeExecutable,
  ]) {
    await access(executable, constants.X_OK);
  }
  const probe = await runProcess(
    "/usr/bin/unshare",
    ["--user", "--map-root-user", "--", "/bin/true"],
    { timeoutMs: 5000 },
  );
  if (probe.exitCode !== 0)
    throw new Error(`User namespaces are unavailable: ${probe.stderr.trim()}`);
}

function bindSystem(args, path) {
  args.push("--ro-bind", path, path);
}

export async function runSandboxed({
  workspace,
  agentDirectory,
  packageDirectory,
  relayDirectory,
  guest,
  relayPort,
  piArguments,
  timeoutMs,
  extraReadOnlyFiles = [],
}) {
  const args = [
    "--user",
    "--map-root-user",
    "--mount",
    "--pid",
    "--ipc",
    "--uts",
    "--net",
    "--fork",
    "--kill-child",
    "--mount-proc=/proc",
    "--",
    "/usr/bin/bwrap",
    "--die-with-parent",
    "--new-session",
    "--unshare-pid",
    "--as-pid-1",
    "--cap-add",
    "CAP_NET_ADMIN",
    "--clearenv",
    "--proc",
    "/proc",
    "--dev",
    "/dev",
    "--tmpfs",
    "/tmp",
  ];
  for (const path of ["/usr", "/bin", "/lib", "/lib64", "/etc"]) {
    try {
      await access(path);
      bindSystem(args, path);
    } catch {}
  }
  args.push(
    "--dir",
    guest.runtime,
    "--dir",
    guest.home,
    "--bind",
    workspace,
    guest.workspace,
    "--bind",
    agentDirectory,
    guest.agent,
    "--ro-bind",
    packageDirectory,
    guest.package,
    "--ro-bind",
    pnpmRoot,
    `${guest.runtime}/node_modules`,
    "--ro-bind",
    nodeExecutable,
    `${guest.runtime}/node`,
    "--ro-bind",
    networkBridge,
    `${guest.runtime}/sandbox-network.mjs`,
    "--ro-bind",
    relayDirectory,
    dirname(guest.relaySocket),
    "--chdir",
    guest.workspace,
  );
  for (const [key, value] of Object.entries(sandboxEnvironment(guest)))
    args.push("--setenv", key, value);
  for (const { source, target } of extraReadOnlyFiles) args.push("--ro-bind", source, target);
  args.push(
    `${guest.runtime}/node`,
    `${guest.runtime}/sandbox-network.mjs`,
    guest.relaySocket,
    String(relayPort),
    `${guest.runtime}/node`,
    ...piArguments,
  );
  return runProcess("/usr/bin/unshare", args, { timeoutMs });
}
