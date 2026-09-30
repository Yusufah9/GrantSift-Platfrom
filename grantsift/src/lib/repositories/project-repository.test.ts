import { describe, it, expect } from "vitest";
import { createFakeSupabase } from "@/test-utils/fake-supabase";
import { ProjectRepository } from "@/lib/repositories/project-repository";
import { ReadinessRepository } from "@/lib/repositories/readiness-repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/** Casts the in-memory fake to the repository's expected client type. Test-only. */
function asClient(fake: ReturnType<typeof createFakeSupabase>): SupabaseClient<Database> {
  return fake as unknown as SupabaseClient<Database>;
}

describe("ProjectRepository (in-memory integration)", () => {
  it("creates a project and can list it back for its owner only", async () => {
    const fake = createFakeSupabase();
    const repo = new ProjectRepository(asClient(fake));

    await repo.create({ user_id: "user-1", name: "Acme Robotics" });
    await repo.create({ user_id: "user-2", name: "Someone else's project" });

    const ownedByUser1 = await repo.listForUser("user-1");
    expect(ownedByUser1).toHaveLength(1);
    expect(ownedByUser1[0]?.name).toBe("Acme Robotics");
  });

  it("returns null from getById for a non-existent project rather than throwing", async () => {
    const fake = createFakeSupabase();
    const repo = new ProjectRepository(asClient(fake));
    expect(await repo.getById("does-not-exist")).toBeNull();
  });

  it("assigns each created project its own id", async () => {
    const fake = createFakeSupabase();
    const repo = new ProjectRepository(asClient(fake));
    const a = await repo.create({ user_id: "user-1", name: "First" });
    const b = await repo.create({ user_id: "user-1", name: "Second" });
    expect(a.id).not.toBe(b.id);
  });
});

describe("ReadinessRepository.replaceForProject (in-memory integration)", () => {
  it("replaces a project's readiness items rather than accumulating stale ones", async () => {
    const fake = createFakeSupabase();
    const repo = new ReadinessRepository(asClient(fake));

    await repo.replaceForProject("proj-1", [
      { project_id: "proj-1", requirement: "Old requirement, no longer extracted", is_met: false },
    ]);
    let items = await repo.listForProject("proj-1");
    expect(items).toHaveLength(1);

    // A re-run with a fresh, smaller requirement set should fully replace the old one.
    await repo.replaceForProject("proj-1", [
      { project_id: "proj-1", requirement: "New requirement", is_met: true },
    ]);
    items = await repo.listForProject("proj-1");
    expect(items).toHaveLength(1);
    expect(items[0]?.requirement).toBe("New requirement");
  });

  it("leaves other projects' readiness items untouched", async () => {
    const fake = createFakeSupabase();
    const repo = new ReadinessRepository(asClient(fake));

    await repo.replaceForProject("proj-1", [{ project_id: "proj-1", requirement: "A", is_met: true }]);
    await repo.replaceForProject("proj-2", [{ project_id: "proj-2", requirement: "B", is_met: true }]);

    await repo.replaceForProject("proj-1", []);

    expect(await repo.listForProject("proj-1")).toHaveLength(0);
    expect(await repo.listForProject("proj-2")).toHaveLength(1);
  });
});
