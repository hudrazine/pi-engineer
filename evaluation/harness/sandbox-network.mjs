import net from "node:net";
import { spawn, spawnSync } from "node:child_process";

export async function runNetworkBridge({ socketPath, port, command, args }) {
  const loopback = spawnSync("/usr/sbin/ip", ["link", "set", "lo", "up"], { encoding: "utf8" });
  if (loopback.status !== 0)
    throw new Error(`Could not enable sandbox loopback: ${loopback.stderr}`);

  const server = net.createServer((client) => {
    const relay = net.createConnection(socketPath);
    client.pipe(relay).pipe(client);
    const close = () => {
      client.destroy();
      relay.destroy();
    };
    client.once("error", close);
    relay.once("error", close);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  const child = spawn(
    "/usr/bin/setpriv",
    [
      "--no-new-privs",
      "--bounding-set=-all",
      "--inh-caps=-all",
      "--ambient-caps=-all",
      command,
      ...args,
    ],
    { stdio: "inherit", env: process.env },
  );
  const result = await new Promise((resolve) => {
    child.once("error", (error) => resolve({ code: 127, signal: null, error }));
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  await new Promise((resolve) => server.close(resolve));
  if (result.error) throw result.error;
  if (result.signal) process.kill(process.pid, result.signal);
  process.exitCode = result.code ?? 1;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [socketPath, port, command, ...args] = process.argv.slice(2);
  if (!socketPath || !port || !command)
    throw new Error("sandbox-network requires socket, port, command, and arguments");
  await runNetworkBridge({ socketPath, port: Number(port), command, args });
}
