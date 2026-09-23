/**
 * WHAT: The last thing standing between a thrown error and a white screen.
 * WHY:  A blank page tells the owner their money records are gone. They are
 *       not — the data is in IndexedDB and untouched — so the fallback says so
 *       explicitly, because the fear is the problem, not the stack trace.
 * INTERVIEW: I wrote the crash screen to answer the question the user actually
 *       has, which is whether their data survived, not what went wrong.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | undefined
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: undefined }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Logged to the console and nowhere else. Nothing leaves the device without
    // a stated reason, and there is no reason here (M2).
    console.error('Mizaniya crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        role="alert"
        className="mx-auto flex min-h-screen max-w-[520px] flex-col justify-center gap-16 px-16"
      >
        <h1 className="font-voice text-title text-ink">Something went wrong</h1>
        {/* The sentence that matters. Everything is still on the device. */}
        <p className="font-structural text-body text-soft">
          Your records are safe — nothing was lost. Reloading usually fixes this.
        </p>
        <div>
          <Button onClick={() => window.location.reload()}>Reload the app</Button>
        </div>
        <p className="font-structural text-small text-faint">
          If it keeps happening, export your data from Settings and keep the file somewhere
          safe.
        </p>
      </div>
    )
  }
}
