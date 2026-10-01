/**
 * A small in-memory stand-in for the subset of the supabase-js query
 * builder our repositories actually call: from().select().eq().order(),
 * .maybeSingle()/.single(), .insert().select().single(), .update().eq(),
 * .delete().eq(). It is not a general Postgres emulator — it exists so
 * repository logic (filtering, replace-on-conflict, id generation) can be
 * exercised without a live database.
 */
type Row = Record<string, unknown>;

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `fake-id-${idCounter}`;
}

class FakeQueryBuilder {
  private filters: Array<(row: Row) => boolean> = [];
  private sortCol: string | null = null;
  private sortAscending = true;
  private pendingInsert: Row[] | null = null;
  private pendingUpdate: Row | null = null;
  private pendingDelete = false;
  private wantsSingle: "one" | "maybe" | null = null;

  constructor(
    private readonly table: Row[],
    private readonly onMutate: () => void,
  ) {}

  select(_cols?: string) {
    return this;
  }

  eq(col: string, value: unknown) {
    this.filters.push((row) => row[col] === value);
    return this;
  }

  neq(col: string, value: unknown) {
    this.filters.push((row) => row[col] !== value);
    return this;
  }

  in(col: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[col]));
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.sortCol = col;
    this.sortAscending = opts?.ascending ?? true;
    return this;
  }

  insert(rows: Row | Row[]) {
    this.pendingInsert = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(patch: Row) {
    this.pendingUpdate = patch;
    return this;
  }

  delete() {
    this.pendingDelete = true;
    return this;
  }

  maybeSingle() {
    this.wantsSingle = "maybe";
    return this.resolve();
  }

  single() {
    this.wantsSingle = "one";
    return this.resolve();
  }

  // Awaiting the builder itself (no terminal method) matches how our
  // repositories call insert/update/delete without .single().
  then<T>(resolve: (value: { data: unknown; error: null }) => T) {
    return Promise.resolve(this.resolve()).then(resolve);
  }

  private matches(row: Row): boolean {
    return this.filters.every((f) => f(row));
  }

  private resolve(): { data: unknown; error: null } {
    if (this.pendingDelete) {
      const toRemove = this.table.filter((r) => this.matches(r));
      for (const row of toRemove) {
        const idx = this.table.indexOf(row);
        if (idx >= 0) this.table.splice(idx, 1);
      }
      this.onMutate();
      return { data: null, error: null };
    }

    if (this.pendingUpdate) {
      const updated: Row[] = [];
      for (const row of this.table) {
        if (this.matches(row)) {
          Object.assign(row, this.pendingUpdate);
          updated.push(row);
        }
      }
      this.onMutate();
      return this.finish(updated);
    }

    if (this.pendingInsert) {
      const inserted = this.pendingInsert.map((r) => ({ id: nextId(), created_at: new Date().toISOString(), ...r }));
      this.table.push(...inserted);
      this.onMutate();
      return this.finish(inserted);
    }

    let results = this.table.filter((r) => this.matches(r));
    if (this.sortCol) {
      const col = this.sortCol;
      results = [...results].sort((a, b) => {
        const av = String(a[col] ?? "");
        const bv = String(b[col] ?? "");
        return this.sortAscending ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return this.finish(results);
  }

  private finish(results: Row[]): { data: unknown; error: null } {
    if (this.wantsSingle === "one") return { data: results[0] ?? null, error: null };
    if (this.wantsSingle === "maybe") return { data: results[0] ?? null, error: null };
    return { data: results, error: null };
  }
}

export function createFakeSupabase(seed: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = {};
  for (const [name, rows] of Object.entries(seed)) tables[name] = [...rows];

  return {
    from(table: string) {
      if (!tables[table]) tables[table] = [];
      return new FakeQueryBuilder(tables[table], () => {});
    },
    _dump(table: string) {
      return tables[table] ?? [];
    },
  };
}

