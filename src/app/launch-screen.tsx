import { Mark } from '@/ui/mark'
import { WordmarkArabic } from '@/ui/wordmark-arabic'

export function LaunchScreen() {
  return (
    <div
      // `status`, not a spinner. The artboard draws no spinner, and a screen
      // reader must still be told the app is working rather than finished.
      role="status"
      aria-live="polite"
      className="relative flex min-h-screen flex-col items-center justify-center gap-[22px] px-26"
    >
      {/* The bare mark here, not the app-icon tile: the tile belongs to the
          welcome screen, which is where the installed identity is established. */}
      <Mark size={74} className="text-emerald" />

      <div className="text-center">
        {/* 31/36 here, not a type step: `brand/README.md` owns the wordmark's
            four sizes, and the launch panel is the smallest of them. */}
        <div className="font-voice text-[31px] font-semibold leading-9 text-ink">Mizaniya</div>
        {/* Under the Latin, never above it, and never carrying a figure. */}
        <WordmarkArabic latin={31} className="mx-auto text-soft" />
      </div>

      <p className="absolute inset-x-0 bottom-[34px] text-center font-structural text-small text-faint">
        Everything stays on this device
      </p>

      <span className="sr-only">Opening your records…</span>
    </div>
  )
}
