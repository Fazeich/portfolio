import { describe, expect, it } from "vitest";
import { advanceExpedition, BEACONS, CRYSTALS, energyLeft, freshExpedition, parseExpedition } from "./expedition";

describe("expedition progression", () => {
  it("prevents unknown or duplicate pickups and unfunded restoration", () => {
    const fresh = freshExpedition();
    expect(advanceExpedition(fresh, { type: "collect", id: "invalid" })).toBe(fresh);
    expect(advanceExpedition(fresh, { type: "restore", id: BEACONS[0].id })).toBe(fresh);
    const collected = advanceExpedition(fresh, { type: "collect", id: CRYSTALS[0].id });
    expect(advanceExpedition(collected, { type: "collect", id: CRYSTALS[0].id })).toBe(collected);
    expect(advanceExpedition(collected, { type: "complete" })).toBe(collected);
  });
  it("supports a full expedition in any beacon order with enough local energy", () => {
    let save = freshExpedition();
    for (const beacon of [...BEACONS].reverse()) {
      save = advanceExpedition(save, { type: "discover", id: beacon.id });
      for (const crystal of CRYSTALS.filter((c) => c.id.startsWith(beacon.id)).slice(0, 3)) save = advanceExpedition(save, { type: "collect", id: crystal.id });
      save = advanceExpedition(save, { type: "restore", id: beacon.id });
      expect(energyLeft(save)).toBe(0);
      expect(advanceExpedition(save, { type: "restore", id: beacon.id })).toBe(save);
    }
    expect(save.completed).toBe(false);
    save = advanceExpedition(save, { type: "complete" });
    expect(save.completed).toBe(true);
    expect(parseExpedition(JSON.stringify(save))).toEqual(save);
  });
  it("repairs corrupt, duplicated and impossible saves", () => {
    expect(parseExpedition("not json")).toEqual(freshExpedition());
    expect(parseExpedition('{"collected":42}')).toEqual(freshExpedition());
    const save = parseExpedition(JSON.stringify({ collected: [CRYSTALS[0].id, CRYSTALS[0].id, null], discovered: [BEACONS[0].id], restored: BEACONS.map((b) => b.id), completed: true }));
    expect(save.collected).toHaveLength(1);
    expect(save.restored).toHaveLength(0);
    expect(save.completed).toBe(false);
  });
});
