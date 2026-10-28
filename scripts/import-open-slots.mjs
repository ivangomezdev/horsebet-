// Run against the reviewed, pinned upstream checkout; no dependency installation.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
const root = "outputs/metaincognita-source/app";
const target = "lib/games/vendor/metaincognita";
const files = {
  "engine/video.ts": "video.js",
  "engine/videoAwards.ts": "videoAwards.js",
  "engine/awards.ts": "awards.js",
  "engine/cascade.ts": "cascade.js",
  "engine/wheelGame.ts": "wheelGame.js",
  "engine/progressive.ts": "progressive.js",
  "machines/temple-of-gold.ts": "temple-of-gold.js",
  "machines/wonder-wheel.ts": "wonder-wheel.js",
  "machines/ruby-of-gargoyle.ts": "ruby-of-gargoyle.js",
  "machines/dragons-hoard.ts": "dragons-hoard.js",
  "machines/canal-royale.ts": "canal-royale.js",
  "components/game/symbols/registry.ts": "symbols.js",
};
mkdirSync(target, { recursive: true });
for (const [input, output] of Object.entries(files)) {
  const source = stripTypeScriptTypes(readFileSync(`${root}/${input}`, "utf8"))
    .replaceAll("'./videoAwards'", "'./videoAwards.js'")
    .replaceAll("'../engine/videoAwards'", "'./videoAwards.js'")
    .replaceAll("'./awards'", "'./awards.js'");
  writeFileSync(`${target}/${output}`, `// Adapted from cschweda/metaincognita-slots, c09d03ac9ae028e1e0943c9935480dde3b6ed443\n// Copyright (c) 2026 Chris Schweda. MIT; see public/licenses/metaincognita-slots.txt.\n${source}`);
}
writeFileSync("public/licenses/metaincognita-slots.txt", readFileSync("outputs/metaincognita-source/LICENSE"));
