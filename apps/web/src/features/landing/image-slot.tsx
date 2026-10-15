/**
 * A photograph the design specified and nobody has sourced yet.
 *
 * `docs/design/image-brief.md` fixes both slots exactly — dimensions, weight
 * budget, what is in the frame — and states that the files are not in the
 * repository. So this reserves the space rather than faking it: the right
 * height, the brief's own description where a caption would go, and nothing
 * that shifts when a real image arrives.
 *
 * **Not an error state and not an empty state.** Nothing has failed and nothing
 * is missing from the owner's data — a photograph has not been bought. Drawing
 * it as a fault would be a lie about whose problem it is.
 */
export interface ImageSlotProps {
  /** The slot's name in `image-brief.md`, so the two cannot drift apart. */
  name: 'landing-recognition' | 'landing-paid'
  title: string
  description: string
}

export function ImageSlot({ name, title, description }: ImageSlotProps) {
  return (
    <figure
      data-slot={name}
      className="flex min-h-[13.75rem] flex-col justify-center gap-8 rounded-card border border-dashed border-hair bg-card px-16 py-24 text-center"
    >
      <p className="font-structural text-lab uppercase text-faint">Image slot</p>
      <p className="font-voice text-h2 text-ink">{title}</p>
      <figcaption className="mx-auto max-w-[32rem] font-structural text-small text-soft">
        {description}
      </figcaption>
    </figure>
  )
}
