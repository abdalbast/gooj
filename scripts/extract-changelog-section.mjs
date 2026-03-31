#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [, , heading, changelogPathArg] = process.argv;

if (!heading) {
  console.error("Usage: node scripts/extract-changelog-section.mjs <heading> [changelog-path]");
  process.exit(1);
}

const changelogPath = path.resolve(changelogPathArg || "CHANGELOG.md");
const changelog = fs.readFileSync(changelogPath, "utf8");
const lines = changelog.split(/\r?\n/);
const targetHeading = `## ${heading}`.trim();
const startIndex = lines.findIndex((line) => line.trim() === targetHeading);

if (startIndex === -1) {
  console.error(`Could not find heading "${targetHeading}" in ${changelogPath}.`);
  process.exit(1);
}

let endIndex = lines.length;

for (let index = startIndex + 1; index < lines.length; index += 1) {
  if (lines[index].startsWith("## ")) {
    endIndex = index;
    break;
  }
}

const section = lines.slice(startIndex, endIndex).join("\n").trim();
process.stdout.write(`${section}\n`);
