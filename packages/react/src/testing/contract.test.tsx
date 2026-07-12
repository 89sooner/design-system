import { forwardRef, type ButtonHTMLAttributes, type ComponentPropsWithoutRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { cx } from "../cx";
import { contractFailures, runContractSuite } from "./contract";

type FixtureProps = ComponentPropsWithoutRef<"button">;

const Fixture = forwardRef<HTMLButtonElement, FixtureProps>(({ className, ...props }, ref) => (
  <button ref={ref} className={cx("cdt-fixture", className)} {...props} />
));
Fixture.displayName = "Fixture";

runContractSuite("Fixture", Fixture, {}, "cdt-fixture");

afterEach(cleanup);

describe("shared contract failure fixture", () => {
  test("FR-CMP-001 exception: a component that drops forwarded props violates the shared contract", () => {
    const Broken = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(() => (
      <button className="cdt-broken" />
    ));
    let received: HTMLButtonElement | null = null;
    const { container } = render(
      <Broken
        ref={(node) => { received = node; }}
        className="consumer-class"
        data-testid="contract-root"
        aria-label="Contract root"
        title="Native title"
      />,
    );

    expect(contractFailures({ root: container.firstElementChild, receivedRef: received, expectedClassName: "cdt-broken" })).toEqual([
      "ref",
      "className",
      "data/aria",
      "native props",
    ]);
  });
});
