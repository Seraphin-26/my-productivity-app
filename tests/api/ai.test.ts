// tests/api/ai.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "clerk_test_123" }),
}));

const mockPrisma = {
  note:       { findFirst: vi.fn() },
  aI_Insight: { upsert:    vi.fn() },
};
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const MOCK_AI_RESPONSE = {
  summary: "Résumé de test en deux phrases. Voici la deuxième phrase.",
  suggestedTasks: [
    { id: "t1", label: "Tâche 1", priority: "high"   },
    { id: "t2", label: "Tâche 2", priority: "medium" },
    { id: "t3", label: "Tâche 3", priority: "low"    },
  ],
  suggestedTags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
};

const mockCreate = vi.fn().mockResolvedValue({
  choices: [{ message: { content: JSON.stringify(MOCK_AI_RESPONSE) } }],
});

vi.mock("groq-sdk", () => {
  return {
    default: class MockGroq {
      chat = { completions: { create: mockCreate } };
      constructor() {}
    },
  };
});

const { POST } = await import("@/app/api/ai/analyze/route");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/ai/analyze", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("POST /api/ai/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.note.findFirst.mockResolvedValue({ id: "note_1" });
    mockPrisma.aI_Insight.upsert.mockResolvedValue({});
  });

  it("retourne un insight IA valide", async () => {
    const req  = makeRequest({ noteId: "clv1234567890abcdefghijklmn", title: "Ma note", content: "Contenu de test" });
    const res  = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.summary).toBeDefined();
    expect(data.suggestedTasks).toHaveLength(3);
    expect(data.suggestedTags).toHaveLength(5);
    expect(data.modelUsed).toBe("llama-3.3-70b-versatile");
  });

  it("retourne 401 si non authentifié", async () => {
    const { auth } = await import("@clerk/nextjs/server");
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);

    const req = makeRequest({ noteId: "clv1234567890abcdefghijklmn", title: "Test" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("retourne 404 si la note n'appartient pas à l'utilisateur", async () => {
    mockPrisma.note.findFirst.mockResolvedValue(null);
    const req = makeRequest({ noteId: "clv1234567890abcdefghijklmn", title: "Test" });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("retourne 422 si noteId manquant", async () => {
    const req = makeRequest({ title: "Test sans noteId" });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("retourne 422 si titre vide", async () => {
    const req = makeRequest({ noteId: "clv1234567890abcdefghijklmn", title: "" });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("la réponse contient les 3 tâches avec priorité valide", async () => {
    const req  = makeRequest({ noteId: "clv1234567890abcdefghijklmn", title: "Test", content: "Contenu" });
    const res  = await POST(req);
    const data = await res.json();

    data.suggestedTasks.forEach((task: { priority: string }) => {
      expect(["low", "medium", "high"]).toContain(task.priority);
    });
  });
});
