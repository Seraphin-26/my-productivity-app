// tests/unit/notes.test.ts
import { describe, it, expect } from "vitest";

// ─── Fonctions utilitaires testées ───────────────────────────────────────────

function getProgressPercent(total: number, done: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

function filterNotesByStatus(notes: Array<{ status: string }>, status: string) {
  return notes.filter(n => n.status === status);
}

function formatTags(tags: string[]): string[] {
  return tags
    .map(t => t.toLowerCase().trim().replace(/\s+/g, "-"))
    .filter(t => t.length > 0);
}

function truncateTitle(title: string, max = 300): string {
  return title.length > max ? title.slice(0, max) + "…" : title;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getProgressPercent", () => {
  it("retourne 0 si aucune tâche", () => {
    expect(getProgressPercent(0, 0)).toBe(0);
  });

  it("retourne 100 si toutes les tâches sont terminées", () => {
    expect(getProgressPercent(4, 4)).toBe(100);
  });

  it("retourne 50 si la moitié est terminée", () => {
    expect(getProgressPercent(4, 2)).toBe(50);
  });

  it("arrondit correctement (33%)", () => {
    expect(getProgressPercent(3, 1)).toBe(33);
  });

  it("arrondit correctement (67%)", () => {
    expect(getProgressPercent(3, 2)).toBe(67);
  });
});

describe("filterNotesByStatus", () => {
  const notes = [
    { id: "1", title: "A", status: "TODO"        },
    { id: "2", title: "B", status: "DONE"        },
    { id: "3", title: "C", status: "TODO"        },
    { id: "4", title: "D", status: "IN_PROGRESS" },
  ];

  it("filtre les notes TODO", () => {
    expect(filterNotesByStatus(notes, "TODO")).toHaveLength(2);
  });

  it("filtre les notes DONE", () => {
    expect(filterNotesByStatus(notes, "DONE")).toHaveLength(1);
  });

  it("filtre les notes IN_PROGRESS", () => {
    expect(filterNotesByStatus(notes, "IN_PROGRESS")).toHaveLength(1);
  });

  it("retourne tableau vide si aucune correspondance", () => {
    expect(filterNotesByStatus(notes, "ARCHIVED")).toHaveLength(0);
  });
});

describe("formatTags", () => {
  it("convertit en minuscules", () => {
    expect(formatTags(["NextJS", "REACT"])).toEqual(["nextjs", "react"]);
  });

  it("remplace les espaces par des tirets", () => {
    expect(formatTags(["mon tag"])).toEqual(["mon-tag"]);
  });

  it("supprime les tags vides", () => {
    expect(formatTags(["", "  ", "valid"])).toEqual(["valid"]);
  });

  it("gère un tableau vide", () => {
    expect(formatTags([])).toEqual([]);
  });
});

describe("truncateTitle", () => {
  it("ne tronque pas si titre court", () => {
    expect(truncateTitle("Titre court")).toBe("Titre court");
  });

  it("tronque si titre trop long", () => {
    const long = "a".repeat(350);
    const result = truncateTitle(long);
    expect(result).toHaveLength(301); // 300 + "…"
    expect(result.endsWith("…")).toBe(true);
  });

  it("respecte la limite personnalisée", () => {
    expect(truncateTitle("abcdef", 3)).toBe("abc…");
  });
});
