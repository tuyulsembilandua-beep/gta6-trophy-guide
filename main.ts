// Leonida Trophy Guide — the hand-in program for gta6-trophy-guide-01.
//
// The guide itself is plain static files in app/ (index.html, its ES modules,
// its stylesheet and app/data/trophies.json), made to open in a desktop browser
// and work with the network off. This program, run on Node 22 with the standard
// library only, copies app/ and screenshots/ into the output folder and writes
// dossier.json there with the vendored make.fun library — the summary the judge
// reads. vendor/makefun-frontend.ts is the kit's copy and must stay untouched:
// the scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run it locally like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader's container MAKEFUN_OUTPUT_DIR is unset and /output is used.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where this program lives, and where the entry goes.
const entryRoot = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The whole app, then the screenshots, then the dossier that describes them.
mkdirSync(outputRoot, { recursive: true });
cpSync(join(entryRoot, 'app'), join(outputRoot, 'app'), { recursive: true });
mkdirSync(join(outputRoot, 'screenshots'), { recursive: true });
if (existsSync(join(entryRoot, 'screenshots'))) {
  cpSync(join(entryRoot, 'screenshots'), join(outputRoot, 'screenshots'), { recursive: true });
}

// The scorer's caps, from the kit's reference/gate.json: at most 4 screenshots
// of 256 KiB, app/ at most 993 files and directories and 48 MiB, and the
// dossier text at most 160 KiB. An entry past any of them is refused here
// with the library's own words, the same refusal the scorer would give.
const dossier = buildDossier(outputRoot, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputRoot, 'dossier.json'), dossier);
