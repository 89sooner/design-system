import { afterEach, expect, test, vi } from "vitest";
import { cx } from "../cx";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

test("SCN-001 exception: a missing @conductor-by-89soone/css import warns once in development", () => {
  vi.useFakeTimers();
  vi.stubEnv("NODE_ENV", "development");
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  expect(cx("cdt-btn", "consumer-class")).toBe("cdt-btn consumer-class");
  expect(cx("cdt-panel")).toBe("cdt-panel");
  vi.runAllTimers();

  expect(warn).toHaveBeenCalledOnce();
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('Import "@conductor-by-89soone/css"'));
});
