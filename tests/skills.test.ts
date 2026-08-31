/* oxlint-disable typescript/no-unsafe-type-assertion -- The pnpm pack CLI emits untyped JSON that this test validates immediately. */

import {
  formatSkillsForPrompt,
  loadSkills,
  type ResourceDiagnostic,
  type Skill,
} from "@earendil-works/pi-coding-agent";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, test } from "vite-plus/test";
import packageJson from "../package.json" with { type: "json" };
import { buildPiEngineerPrompt } from "../src/system-prompt.ts";

const repository = resolve(import.meta.dirname, "..");
const skillsDirectory = join(repository, "skills");
const discoveryFixture = join(import.meta.dirname, "fixtures", "discover-package-skills.mjs");

interface DiscoveryResult {
  version: string;
  skills: Skill[];
  diagnostics: ResourceDiagnostic[];
}

function readSkill(name: string): string {
  return readFileSync(join(skillsDirectory, name, "SKILL.md"), "utf8");
}

function writeSkill(directory: string, name: string, description: string): void {
  mkdirSync(join(directory, name), { recursive: true });
  writeFileSync(
    join(directory, name, "SKILL.md"),
    `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n`,
  );
}

function discoverPackageSkills(temporaryRoot: string): DiscoveryResult {
  const workspace = join(temporaryRoot, "workspace");
  const agentDir = join(temporaryRoot, "agent");
  const isolatedHome = join(temporaryRoot, "home");
  mkdirSync(workspace, { recursive: true });
  mkdirSync(agentDir, { recursive: true });
  mkdirSync(isolatedHome, { recursive: true });
  writeFileSync(join(agentDir, "settings.json"), JSON.stringify({ packages: [repository] }));

  const discovered = spawnSync(process.execPath, [discoveryFixture, workspace, agentDir], {
    cwd: workspace,
    encoding: "utf8",
    env: {
      ...process.env,
      HOME: isolatedHome,
      USERPROFILE: isolatedHome,
      PI_OFFLINE: "1",
    },
  });
  expect({ status: discovered.status, stderr: discovered.stderr }).toEqual({
    status: 0,
    stderr: "",
  });

  return JSON.parse(discovered.stdout) as DiscoveryResult;
}

test("publishes the two Package Skills through Pi and npm package metadata", () => {
  expect(packageJson.pi.skills).toEqual(["./skills"]);
  expect(packageJson.files).toEqual(["src", "skills"]);

  const packed = spawnSync("pnpm", ["pack", "--dry-run", "--json"], {
    cwd: repository,
    encoding: "utf8",
  });
  expect({ status: packed.status, stderr: packed.stderr }).toEqual({ status: 0, stderr: "" });

  const files = (JSON.parse(packed.stdout) as { files: Array<{ path: string }> }).files.map(
    ({ path }) => path,
  );
  expect(files).toEqual(
    expect.arrayContaining([
      "package.json",
      "src/index.ts",
      "src/system-prompt.ts",
      "skills/bounded-implementation/SKILL.md",
      "skills/subtractive-code-review/SKILL.md",
    ]),
  );
  expect(files?.some((path) => /^(?:tests|evaluation|docs\/engineering)\//.test(path))).toBe(false);
});

test("loads exactly the standalone Package Skills without validation diagnostics", () => {
  const loaded = loadSkills({
    cwd: repository,
    agentDir: join(repository, ".missing-agent-directory"),
    skillPaths: [skillsDirectory],
    includeDefaults: false,
  });

  expect(loaded.diagnostics).toEqual([]);
  expect(loaded.skills.map(({ name }) => name).toSorted()).toEqual([
    "bounded-implementation",
    "subtractive-code-review",
  ]);
  expect(loaded.skills.every(({ disableModelInvocation }) => !disableModelInvocation)).toBe(true);
  const descriptions = Object.fromEntries(
    loaded.skills.map(({ description, name }) => [name, description]),
  );
  expect(descriptions["bounded-implementation"]).toContain("greenfield or existing code");
  expect(descriptions["bounded-implementation"]).toContain("Avoid read-only work");
  expect(descriptions["subtractive-code-review"]).toContain(
    "completed task diff or bounded existing code area",
  );
  expect(descriptions["subtractive-code-review"]).toContain("Avoid implementation planning");
});

test("discovers both Skills from the local Package in isolated Pi 0.84.2", () => {
  const temporaryRoot = mkdtempSync(join(tmpdir(), "pi-engineer-package-discovery-"));
  try {
    const discovered = discoverPackageSkills(temporaryRoot);

    expect(discovered.version).toBe("0.84.2");
    expect(discovered.diagnostics).toEqual([]);
    expect(discovered.skills.map(({ name }) => name).toSorted()).toEqual([
      "bounded-implementation",
      "subtractive-code-review",
    ]);
    expect(
      discovered.skills.map(({ filePath, sourceInfo }) => ({
        filePath,
        origin: sourceInfo.origin,
        source: sourceInfo.source,
      })),
    ).toEqual(
      expect.arrayContaining([
        {
          filePath: join(skillsDirectory, "bounded-implementation", "SKILL.md"),
          origin: "package",
          source: repository,
        },
        {
          filePath: join(skillsDirectory, "subtractive-code-review", "SKILL.md"),
          origin: "package",
          source: repository,
        },
      ]),
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("preserves Project > User > Package resolution through prompt assembly", () => {
  const temporaryRoot = mkdtempSync(join(tmpdir(), "pi-engineer-package-precedence-"));
  try {
    const projectSkills = join(temporaryRoot, "workspace", ".pi", "skills");
    const userSkills = join(temporaryRoot, "agent", "skills");
    writeSkill(projectSkills, "bounded-implementation", "project bounded replacement");
    writeSkill(userSkills, "bounded-implementation", "user bounded replacement");
    writeSkill(userSkills, "subtractive-code-review", "user subtractive replacement");

    const discovered = discoverPackageSkills(temporaryRoot);
    const descriptions = Object.fromEntries(
      discovered.skills.map(({ description, name }) => [name, description]),
    );

    expect(discovered.version).toBe("0.84.2");
    expect(descriptions).toEqual({
      "bounded-implementation": "project bounded replacement",
      "subtractive-code-review": "user subtractive replacement",
    });
    expect(
      discovered.skills.map(({ name, sourceInfo }) => ({
        name,
        origin: sourceInfo.origin,
        scope: sourceInfo.scope,
      })),
    ).toEqual([
      { name: "bounded-implementation", origin: "top-level", scope: "project" },
      { name: "subtractive-code-review", origin: "top-level", scope: "user" },
    ]);
    expect(discovered.diagnostics.filter(({ type }) => type === "collision")).toHaveLength(3);

    const prompt = buildPiEngineerPrompt({
      cwd: join(temporaryRoot, "workspace"),
      selectedTools: ["read"],
      skills: discovered.skills,
    });
    expect(prompt).toContain(formatSkillsForPrompt(discovered.skills).trim());
    expect(prompt).not.toContain("user bounded replacement");
    expect(prompt).not.toContain("Implement a sufficiently resolved software task");
    expect(prompt).not.toContain("Review a completed task diff or bounded existing code area");
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("defines bounded implementation for resolved greenfield and existing-code work", () => {
  const content = readSkill("bounded-implementation");

  expect(content).toContain("greenfield");
  expect(content).toContain("existing software");
  expect(content).toContain("Task Contract");
  expect(content).toContain("Change Envelope");
  expect(content).toContain("Evidence Gate");
  expect(content).toContain("consequential");
  expect(content).toContain("dedicated subtractive review");
  expect(content).not.toContain("subtractive-code-review");
});

test("defines subtractive review for task diffs and bounded existing code", () => {
  const content = readSkill("subtractive-code-review");

  expect(content).toContain("Task Diff Mode");
  expect(content).toContain("Existing Code Mode");
  expect(content).toContain("review-only");
  expect(content).toContain("DELETE");
  expect(content).toContain("SIMPLIFY");
  expect(content).toContain("DEFER");
  expect(content).not.toContain("bounded-implementation");
});
