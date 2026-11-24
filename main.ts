// Two Days of Quiet Dread — make.fun entry.
//
// The program writes one code review comment to /output/entry.txt: a single
// line of at most 140 characters that approves a pull request while carrying
// quiet existential dread. No network, no input, deterministic — the same
// bytes on every run, so both grader runs gate identically.
//
// How the line is built for the judge's brief (most important first):
//   1. It IS one line approving a PR with quiet dread: "Approved." opens it,
//      "Merging this" is the approval in action, and the dread is the
//      reviewer's own mortality — the closest they will come to leaving a
//      legacy is this merge.
//   2. The laugh comes from the dread itself, not a bolted-on joke: a legacy
//      is the grandest thing a person can leave behind, and here it is
//      deflated in one breath to a bugfix. The dread (I will die, this is
//      all I leave) IS the punchline.
//   3. The dread stays quiet: flat delivery, no exclamation, no melodrama,
//      no cry for help. "And it's a bugfix" lands as a shrug, not a scream.
//   4. It reads like a comment a tired engineer would really paste before
//      clicking approve: "Approved. Merging this..." is the shape of a real
//      review comment, and the self-deprecation is the kind engineers
//      actually write at the end of a long day.
//   5. It finds a fresh turn: "leaving a legacy" is an unexpected phrase
//      for a code review, and pairing it with "a bugfix" is a turn nobody
//      else in the field is likely to have taken. No "LGTM", no "this will
//      outlive us all", no heat death, no "future us".
//
// Fourteen candidates were drafted and judged pairwise against the brief
// (see CANDIDATES.md in the workdir). The runner-up, kept for a possible
// second variant, was: "Approved — the PR is good, the codebase is forever,
// and I am on a fixed-term contract with the universe." It lost on the
// first differing criterion: the frozen line is funnier on the first read,
// flatter, and reads more like a real review comment.

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One beat per job the line has to do, in reading order.
const BEATS: ReadonlyArray<{ role: string; text: string }> = [
  {
    role: "approval",
    text: "Approved.",
  },
  {
    role: "setup",
    text: "Merging this is the closest I'll come to leaving a legacy,",
  },
  { role: "payoff", text: "and it's a bugfix." },
];

const MAX_CHARS = 140;

function charCount(text: string): number {
  // Count characters as code points, so any non-ASCII would count once.
  return [...text].length;
}

function buildLine(): string {
  return BEATS.map((beat) => beat.text).join(" ");
}

function checkLine(text: string): void {
  // The gate: UTF-8 text of 1 to 140 characters, not only white space,
  // a single line, as the brief requires.
  const chars = charCount(text);
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`line must be 1-${MAX_CHARS} characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("line must not be only white space");
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("line must be a single line");
  }
  // It must approve the pull request, in words a reviewer would use.
  if (!text.startsWith("Approved.")) {
    throw new Error("line must open with an approval");
  }
  // The last beat must be the payoff: the line may not trail off after it.
  const lastBeat = BEATS[BEATS.length - 1];
  if (!text.endsWith(lastBeat.text)) {
    throw new Error("line must end on its payoff beat");
  }
  // The dread must be present, not just an approval: the legacy turn.
  if (!text.includes("leaving a legacy")) {
    throw new Error("line must carry its dread turn");
  }
}

function main(): void {
  const line = buildLine();
  checkLine(line);
  for (const beat of BEATS) {
    console.log(`beat ${beat.role}: ${charCount(beat.text)} chars`);
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", line, "utf8");
  // The grader collects the output as another user: leave it readable.
  chmodSync("/output/entry.txt", 0o644);
  // Read back what was written and prove it is the line, byte for byte:
  // the gate scores the file, not the string in memory.
  const written = readFileSync("/output/entry.txt", "utf8");
  if (written !== line) {
    throw new Error("written entry.txt does not match the line");
  }
  checkLine(written);
  console.log(`wrote /output/entry.txt (${charCount(line)} chars): ${line}`);
}

main();
