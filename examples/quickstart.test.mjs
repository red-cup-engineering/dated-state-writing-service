// Adapted from test/dated-state-writing.test.mjs to import the installed package.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createDatedStateCustody } from "@red-cup-engineering/dated-state-writing-service";

async function withRoot(fn) {
  const root = await mkdtemp(join(tmpdir(), "dated-state-writing-"));
  try {
    await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("DATED-STATE-QUICKSTART", async () => {
  await withRoot(async (root) => {
    const custody = createDatedStateCustody({ root });
    const bytes = Buffer.from("dated state contents");
    await custody.put({
      service: "svc",
      type: "kind",
      extension: "txt",
      recordedAt: "2026-01-05T00:00:00Z",
      bytes,
    });
    const read = await custody.get({ service: "svc", type: "kind", extension: "txt", recordedAt: "2026-01-05T00:00:00Z" });
    assert.equal(read.path, join("2026", "01", "05", "2026-01-05-svc-kind.txt"));
    assert.ok(read.bytes.equals(bytes));
    assert.ok(Object.isFrozen(read));
  });
});
