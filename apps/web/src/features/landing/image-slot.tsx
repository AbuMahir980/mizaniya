/**
 * A photograph the design specified and nobody has sourced yet.
 *
 * `docs/design/image-brief.md` fixes both slots exactly — dimensions, weight
 * budget, what is in the frame — and states that the files are not in the
 * repository. So this reserves the space rather than faking it: the board's own
 * four lines, at the board's own size, and nothing that shifts when a real
 * image arrives.
 *
 * **Not an error state and not an empty state.** Nothing has failed and nothing
 * is missing from the owner's data — a photograph has not been bought. Drawing
 * it as a fault would be a lie about whose problem it is.
 */
export interface ImageSlotProps {
  /** The slot's name in `image-brief.md`, so the two cannot drift apart. */
  name: 'landing-recognition' | 'landing-paid'
  title: string
  /** The size and budget the brief fixes, as the board prints it. */
  spec: string
}

export function ImageSlot({ name, title, spec }: ImageSlotProps) {
  return (
    <figure
      data-slot={name}
      className="flex h-[220px] flex-col items-center justify-center overflow-hidden rounded-xl border-[1.5px] border-dashed border-line bg-track p-26 text-center desktop:h-[300px]"
    >
      <figcaption className="font-structural text-lab uppercase text-soft">Image slot</figcaption>
      <p className="mt-6 font-structural text-land-label font-semibold text-ink">{title}</p>
      <p className="mt-6 font-structural text-land-fine leading-[18px] text-soft">
        Brief: landing-page-brief §Images
      </p>
      <p className="mt-12 font-data text-land-micro uppercase tracking-[0.12em] text-soft">
        {spec}
      </p>
    </figure>
  )
}
