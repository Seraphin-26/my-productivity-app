// tests/e2e/app.spec.ts
import { test, expect } from "@playwright/test";

// ─── Landing Page ─────────────────────────────────────────────────────────────

test.describe("Landing Page", () => {
  test("affiche la page d'accueil correctement", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ProductivityAI/);
    await expect(page.getByText("Amplifiées par l'IA")).toBeVisible();
  });

  test("affiche les boutons Sign in et Sign up quand déconnecté", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /commencer gratuitement/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /se connecter/i })).toBeVisible();
  });

  test("affiche les 3 features cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("CRUD complet")).toBeVisible();
    await expect(page.getByText("Magie IA")).toBeVisible();
    await expect(page.getByText("Sécurisé")).toBeVisible();
  });

  test("le bouton Sign up redirige vers /sign-up", async ({ page }) => {
    await page.goto("/");
    // Attendre que Clerk soit chargé
    await page.waitForTimeout(2000);
    const signUpBtn = page.getByRole("link", { name: /commencer gratuitement/i });
    // Si connecté, skip ce test
    if (await signUpBtn.isVisible()) {
      await signUpBtn.click();
      await expect(page).toHaveURL(/sign-up/, { timeout: 10000 });
    } else {
      test.skip(); // déjà connecté
    }
  });

  test("le bouton Sign in redirige vers /sign-in", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const signInBtn = page.getByRole("link", { name: /se connecter/i });
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await expect(page).toHaveURL(/sign-in/, { timeout: 10000 });
    } else {
      test.skip(); // déjà connecté
    }
  });
});

// ─── Auth Pages ───────────────────────────────────────────────────────────────

test.describe("Pages d'authentification", () => {
  test("la page sign-in se charge", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/sign-in/);
    // Clerk prend un peu de temps à charger
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("la page sign-up se charge", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/sign-up/);
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});

// ─── Protection des routes ────────────────────────────────────────────────────

test.describe("Protection des routes", () => {
  test("redirige vers sign-in si accès /dashboard sans auth", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/sign-in|sign-up/, { timeout: 10000 });
    expect(page.url()).toMatch(/sign-in|sign-up/);
  });

  test("redirige vers sign-in si accès /dashboard/tasks sans auth", async ({ page }) => {
    await page.goto("/dashboard/tasks");
    await page.waitForURL(/sign-in|sign-up/, { timeout: 10000 });
    expect(page.url()).toMatch(/sign-in|sign-up/);
  });

  test("redirige vers sign-in si accès /dashboard/ai sans auth", async ({ page }) => {
    await page.goto("/dashboard/ai");
    await page.waitForURL(/sign-in|sign-up/, { timeout: 10000 });
    expect(page.url()).toMatch(/sign-in|sign-up/);
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

test.describe("API Routes", () => {
  test("GET /api/notes retourne 401 ou 404 sans auth", async ({ request }) => {
    const res = await request.get("/api/notes");
    expect([401, 404]).toContain(res.status());
  });

  test("POST /api/notes retourne 401 ou 404 sans auth", async ({ request }) => {
    const res = await request.post("/api/notes", {
      data: { title: "Test", content: "" },
    });
    expect([401, 404]).toContain(res.status());
  });

  test("POST /api/ai/analyze retourne 401 ou 404 sans auth", async ({ request }) => {
    const res = await request.post("/api/ai/analyze", {
      data: { noteId: "test", title: "Test" },
    });
    expect([401, 404]).toContain(res.status());
  });

  test("DELETE /api/ai/analyze retourne 404 ou 405", async ({ request }) => {
    const res = await request.delete("/api/ai/analyze");
    expect([404, 405]).toContain(res.status());
  });
});

// ─── Responsive Mobile ────────────────────────────────────────────────────────

test.describe("Responsive Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

  test("la landing page s'affiche correctement sur mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Amplifiées par l'IA")).toBeVisible();
    await expect(page.getByRole("link", { name: /commencer gratuitement/i })).toBeVisible();
  });
});
