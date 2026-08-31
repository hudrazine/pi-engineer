import { DefaultResourceLoader, SettingsManager, VERSION } from "@earendil-works/pi-coding-agent";

const [cwd, agentDir] = process.argv.slice(2);

if (!cwd || !agentDir) {
  throw new Error("Usage: discover-package-skills.mjs <cwd> <agent-dir>");
}

const settingsManager = SettingsManager.create(cwd, agentDir, { projectTrusted: true });
const resourceLoader = new DefaultResourceLoader({
  cwd,
  agentDir,
  settingsManager,
  noExtensions: true,
  noPromptTemplates: true,
  noThemes: true,
  noContextFiles: true,
});

await resourceLoader.reload();

process.stdout.write(
  JSON.stringify({
    version: VERSION,
    ...resourceLoader.getSkills(),
  }),
);
