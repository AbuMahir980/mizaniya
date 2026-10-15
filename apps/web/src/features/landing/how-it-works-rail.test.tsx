/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { HowItWorksRail } from "./how-it-works-rail";
import { howItWorks } from "./landing-copy";

afterEach(cleanup);

/** jsdom has neither, so each test says which world it is in. */
function motion(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

beforeEach(() => {
  vi.unstubAllGlobals();
  motion(false);
});

describe("nothing is gated behind an animation", () => {
  /**
   * The rule this exists for is `motion.md` §9.1, and the reason it is a rule:
   * these eight lines are the product's strongest claim, so a visitor who
   * scrolls past quickly must still have read them. An animation that never
   * runs — no observer, no JavaScript, motion off — must not be able to hide
   * one of them.
   */
  it("renders all eight questions and answers with no observer at all", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<HowItWorksRail />);

    for (const item of howItWorks) {
      expect(screen.getByRole("heading", { name: item.q })).toBeDefined();
    }
    expect(screen.getAllByRole("article").length).toBe(8);
  });

  it("renders all eight when motion is off, and never offsets them", () => {
    motion(true);
    const { container } = render(<HowItWorksRail />);

    expect(screen.getAllByRole("article").length).toBe(8);
    expect(container.querySelector('[data-rail-enter="pending"]')).toBeNull();
  });

  it("offsets them only while motion is allowed and the band is unseen", () => {
    const observe = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe = observe;
        disconnect = vi.fn();
      },
    );
    const { container } = render(<HowItWorksRail />);

    expect(
      container.querySelector('[data-rail-enter="pending"]'),
    ).not.toBeNull();
    expect(observe).toHaveBeenCalled();
    // Still readable while offset — the claim is never withheld, only moved.
    expect(screen.getAllByRole("article").length).toBe(8);
  });
});

describe("the answers are the ones the record wrote", () => {
  /**
   * ADR-013 required these verbatim, because the scope of each claim is where
   * the honesty lives. A test rather than a comment, so a later edit that
   * widens one — "nobody can ever see your data" — fails rather than ships.
   */
  it("never claims more than the record allows", () => {
    render(<HowItWorksRail />);
    const page = document.body.textContent ?? "";

    expect(page).toContain("One alone opens nothing.");
    expect(page).not.toMatch(/nobody can (ever )?see/i);
    expect(page).not.toMatch(/completely (private|secure)/i);
  });

  it("answers the sharing question in both directions", () => {
    render(<HowItWorksRail />);
    expect(
      screen.getByRole("heading", { name: "Can I share it with my partner?" }),
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { name: "Can I remove them later?" }),
    ).toBeDefined();
  });
});
