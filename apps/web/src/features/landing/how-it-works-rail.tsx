import { useCallback, useEffect, useRef, useState } from "react";
import { howItWorks } from "./landing-copy";

/**
 * `motion.md` §9.1 — 45ms between cards, so the eighth lands at about 600ms.
 * Static classes rather than a computed style, because F1 bans inline style
 * objects and eight known delays do not need to be computed.
 */
const DELAY = [
  "delay-0",
  "delay-[45ms]",
  "delay-[90ms]",
  "delay-[135ms]",
  "delay-[180ms]",
  "delay-[225ms]",
  "delay-[270ms]",
  "delay-[315ms]",
];

/**
 * The eight questions ADR-013 put on the page, as a horizontal rail.
 *
 * **Triggered, never scroll-linked** (§9.1). Tying the cards to scroll position
 * would make the section something a visitor has to operate before it tells them
 * anything, and these are the product's strongest claim: someone who scrolls past
 * quickly must still have read them.
 *
 * So the resting state is the default. The offset is applied on mount, and only
 * when motion is allowed; with no JavaScript, or with motion off, all eight are in
 * place from first paint and the rail still drags.
 */
export function HowItWorksRail() {
  const band = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState<"pending" | "in">("in");

  // Before paint, so a card never appears in place and then jumps aside to
  // animate back. If motion is off this never runs and the default stands.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEntered("pending");
  }, []);

  const land = useCallback(() => setEntered("in"), []);

  useEffect(() => {
    const element = band.current;
    if (entered !== "pending" || element === null) return;

    // No IntersectionObserver — an older browser, or a test environment — means
    // the cards simply stay where they belong.
    if (typeof IntersectionObserver === "undefined") {
      land();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) land();
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [entered, land]);

  return (
    <section aria-labelledby="how-it-works" className="flex flex-col gap-16">
      <p className="font-structural text-lab uppercase text-soft">
        How it works
      </p>
      <h2 id="how-it-works" className="font-voice text-title text-ink">
        There is nothing to sign up for.
      </h2>

      <div
        ref={band}
        data-rail-enter={entered}
        className="-mx-16 flex snap-x snap-mandatory gap-12 overflow-x-auto px-16 pb-8 desktop:-mx-44 desktop:px-44"
      >
        {howItWorks.map((item, index) => (
          <article
            key={item.n}
            className={`rail-card w-[16rem] shrink-0 snap-start rounded-card border border-hair bg-card p-16 ${DELAY[index]}`}
          >
            <p className="font-data text-lab text-faint">{item.n}</p>
            <h3 className="mt-8 font-structural text-body text-soft">
              {item.q}
            </h3>
            <p className="mt-4 font-structural text-body text-ink">{item.a}</p>
            {item.detail === "" ? null : (
              <p className="mt-2 font-structural text-small text-soft">
                {item.detail}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
