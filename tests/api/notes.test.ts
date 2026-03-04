// tests/api/notes.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAuth = vi.fn().mockResolvedValue({ userId: "clerk_test_123" });

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
  note: {
    findMany:  vi.fn(),
    findFirst: vi.fn(),
    create:    vi.fn(),
    update:    vi.fn(),
    delete:    vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

// Import après les mocks
const { GET, POST } = await import("@/app/api/notes/route");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/notes", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const MOCK_USER = { id: "user_1", clerkId: "clerk_test_123", email: "test@test.com", name: "Test" };
const MOCK_NOTE = {
  id: "note_1", title: "Test note", content: "Contenu", status: "TODO",
  tags: ["test"], position: 0, isPinned: false,
  createdAt: new Date(), updatedAt: new Date(), userId: "user_1",
  aiInsight: null,
};

// ─── Tests GET /api/notes ─────────────────────────────────────────────────────

describe("GET /api/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);
    mockPrisma.note.findMany.mockResolvedValue([MOCK_NOTE]);
  });

  it("retourne les notes de l'utilisateur connecté", async () => {
    const res  = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.notes).toHaveLength(1);
    expect(data.notes[0].title).toBe("Test note");
  });

  it("retourne 401 si non authentifié", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("retourne tableau vide si utilisateur inconnu", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res  = await GET();
    const data = await res.json();
    expect(data.notes).toEqual([]);
  });
});

// ─── Tests POST /api/notes ────────────────────────────────────────────────────

describe("POST /api/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);
    mockPrisma.note.findFirst.mockResolvedValue(null);
    mockPrisma.note.create.mockResolvedValue(MOCK_NOTE);
  });

  it("crée une note et retourne 201", async () => {
    const req  = makeRequest("POST", { title: "Nouvelle tâche", content: "Description" });
    const res  = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.note).toBeDefined();
  });

  it("retourne 401 si non authentifié", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null });
    const req = makeRequest("POST", { title: "Test" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("retourne 422 si titre manquant", async () => {
    const req  = makeRequest("POST", { title: "" });
    const res  = await POST(req);
    expect(res.status).toBe(422);
  });

  it("retourne 422 si body invalide", async () => {
    const req  = makeRequest("POST", { mauvais: "champ" });
    const res  = await POST(req);
    expect(res.status).toBe(422);
  });

  it("retourne 404 si utilisateur introuvable", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const req  = makeRequest("POST", { title: "Test" });
    const res  = await POST(req);
    expect(res.status).toBe(404);
  });
});
