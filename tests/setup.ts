// tests/setup.ts
import "@testing-library/jest-dom";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter:   () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/dashboard",
  redirect:    vi.fn(),
}));

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  auth:          () => ({ userId: "test_clerk_id" }),
  currentUser:   () => ({ emailAddresses: [{ emailAddress: "test@test.com" }], fullName: "Test User" }),
  SignedIn:      ({ children }: { children: React.ReactNode }) => children,
  SignedOut:     ({ children }: { children: React.ReactNode }) => children,
  UserButton:    () => null,
  useUser:       () => ({ user: { fullName: "Test User" }, isLoaded: true }),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth:        () => ({ userId: "test_clerk_id" }),
  currentUser: () => ({ emailAddresses: [{ emailAddress: "test@test.com" }], fullName: "Test User" }),
}));
