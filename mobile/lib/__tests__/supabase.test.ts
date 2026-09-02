import { describe, expect, it, vi } from "vitest";

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: {} })),
}));

import * as SecureStore from "expo-secure-store";
import { ExpoSecureStoreAdapter as adapter } from "../supabase";

describe("ExpoSecureStoreAdapter", () => {
  it("removes items via SecureStore.deleteItemAsync", async () => {
    // Regression: expo-secure-store has no removeItemAsync — using it broke
    // sign-out and session cleanup at runtime.
    vi.mocked(SecureStore.deleteItemAsync).mockResolvedValueOnce();

    await adapter.removeItem("sb-session");

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("sb-session");
  });

  it("reads items via SecureStore.getItemAsync", async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce("stored-value");

    await expect(adapter.getItem("sb-session")).resolves.toBe("stored-value");
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("sb-session");
  });

  it("returns null instead of throwing when the store read fails", async () => {
    vi.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error("keychain error"));

    await expect(adapter.getItem("sb-session")).resolves.toBeNull();
  });

  it("writes items via SecureStore.setItemAsync", async () => {
    vi.mocked(SecureStore.setItemAsync).mockResolvedValueOnce();

    await adapter.setItem("sb-session", "session-json");

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("sb-session", "session-json");
  });
});
