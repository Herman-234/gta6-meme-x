// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: a GTA 6 meme whose picture carries the
// make.fun ghost, posted from @ABAH90ok with make.fun and the entrant's play
// code in its text. This program does the one thing the gate needs from the
// repository: it carries POST.json (the post's address on X) from the
// repository root into the output directory, where the gate reads it. The
// house reads the post from X itself and builds the dossier the judge sees;
// nothing this program writes about the post is judged.
//
// Outside the grader, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for
// /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'POST.json');
const target = join(OUTPUT_DIR, 'POST.json');

mkdirSync(OUTPUT_DIR, { recursive: true });

let raw: Buffer;
try {
  raw = readFileSync(source);
} catch (error) {
  console.error(
    `POST.json could not be read from ${source}: ${(error as Error).message}`,
  );
  process.exit(1);
}

let post: unknown;
try {
  post = JSON.parse(raw.toString('utf8'));
} catch (error) {
  console.error(
    `POST.json is not valid JSON: ${(error as Error).message}`,
  );
  process.exit(1);
}

if (
  typeof post !== 'object' ||
  post === null ||
  typeof (post as { url?: unknown }).url !== 'string'
) {
  console.error('POST.json must be a JSON object with a string "url" field.');
  process.exit(1);
}

// Write the exact bytes that were read, so the copy is byte for byte.
writeFileSync(target, raw);

// Read the copy back and check it matches, so a silent partial write
// cannot pass as a good copy: the gate reads this file.
const written = readFileSync(target);
if (!written.equals(raw)) {
  console.error(`POST.json copy to ${target} does not match the source.`);
  process.exit(1);
}
console.log(`POST.json copied to ${target} (${raw.length} bytes).`);
