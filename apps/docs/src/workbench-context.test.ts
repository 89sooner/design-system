// Refs: CR-079 FR-CMP-010 AC-8
import { describe, expect, it } from "vitest";
import { hashSearch, onPage, readSnapshot, restorable, writeSnapshot, type WorkbenchSnapshot } from "./workbench-context";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => { map.delete(key); },
    setItem: (key, value) => { map.set(key, value); },
  };
}

const snapshot: WorkbenchSnapshot = { search: "?q=cache", limit: 50, selected: "pr-42", scrollY: 640, mode: "ready", count: 100 };

describe("CR-079 FR-CMP-010 AC-8: workbench round-trip snapshot", () => {
  it("reads back what it wrote for the same history entry, and nothing for another entry", () => {
    const storage = memoryStorage();
    writeSnapshot(storage, "entry-a", snapshot);
    expect(readSnapshot(storage, "entry-a")).toEqual(snapshot);
    expect(readSnapshot(storage, "entry-b")).toBeNull();
  });

  it("applies only to the same search", () => {
    expect(restorable(snapshot, "?q=cache")).toBe(true);
    expect(restorable(snapshot, "?q=other")).toBe(false);
    expect(restorable(null, "?q=cache")).toBe(false);
  });

  it("treats malformed or missing storage as no snapshot instead of throwing", () => {
    const storage = memoryStorage();
    storage.setItem("conductor-workbench:broken", "{not json");
    storage.setItem("conductor-workbench:partial", JSON.stringify({ search: "", limit: "50" }));
    expect(readSnapshot(storage, "broken")).toBeNull();
    expect(readSnapshot(storage, "partial")).toBeNull();
    expect(readSnapshot(undefined, "entry-a")).toBeNull();
    const throwing = { ...memoryStorage(), setItem: () => { throw new Error("QuotaExceededError"); }, getItem: () => { throw new Error("SecurityError"); } } as Storage;
    expect(() => writeSnapshot(throwing, "entry-a", snapshot)).not.toThrow();
    expect(readSnapshot(throwing, "entry-a")).toBeNull();
  });

  it("clamps restored numbers to a range the page can show", () => {
    const storage = memoryStorage();
    storage.setItem("conductor-workbench:clamp", JSON.stringify({ search: "", limit: 0.4, scrollY: -20, selected: 7 }));
    expect(readSnapshot(storage, "clamp")).toEqual({ search: "", limit: 1, selected: null, scrollY: 0, mode: "ready", count: 100 });
  });

  it("saves only while the hash still routes to the workbench", () => {
    expect(onPage("#/examples/workbench?q=cache", "/examples/workbench")).toBe(true);
    expect(onPage("#/examples/workbench", "/examples/workbench")).toBe(true);
    expect(onPage("#/examples/relations", "/examples/workbench")).toBe(false);
  });

  it("takes the search part of a hash route", () => {
    expect(hashSearch("#/examples/workbench?q=cache&state=open")).toBe("?q=cache&state=open");
    expect(hashSearch("#/examples/workbench")).toBe("");
  });
});
