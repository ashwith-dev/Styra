import { describe, expect, it } from "vitest";
import { AppError, getUserFacingMessage, toAppError } from "../errors";

describe("toAppError", () => {
  it("passes through an existing AppError", () => {
    const err = new AppError("boom", 500);
    expect(toAppError(err)).toBe(err);
  });

  it("wraps plain errors, strings, and unknown values", () => {
    expect(toAppError(new Error("bad")).message).toBe("bad");
    expect(toAppError("oops").message).toBe("oops");
    expect(toAppError(undefined).message).toBe("Something went wrong");
  });
});

describe("getUserFacingMessage", () => {
  it("maps network errors (status 0) to a connection message", () => {
    const err = new AppError("Network Error", 0);
    expect(getUserFacingMessage(err)).toBe(
      "Unable to connect. Please check your internet connection and try again.",
    );
  });

  it("maps 401 errors to a session-expired message", () => {
    const err = new AppError("Unauthorized", 401);
    expect(getUserFacingMessage(err)).toBe(
      "Your session has expired. Please sign in again.",
    );
  });

  it("unwraps a string detail from the server payload", () => {
    const err = new AppError("Request failed (400)", 400, {
      detail: "Image does not contain clothing",
    });
    expect(getUserFacingMessage(err)).toBe("Image does not contain clothing");
  });

  it("unwraps nested detail.error and detail.message shapes", () => {
    expect(
      getUserFacingMessage(
        new AppError("fail", 422, { detail: { error: "bad attribute" } }),
      ),
    ).toBe("bad attribute");
    expect(
      getUserFacingMessage(
        new AppError("fail", 422, { detail: { message: "invalid value" } }),
      ),
    ).toBe("invalid value");
  });

  it("falls back to the error message for other server errors", () => {
    const err = new AppError("Request failed (500)", 500);
    expect(getUserFacingMessage(err)).toBe("Request failed (500)");
  });
});
