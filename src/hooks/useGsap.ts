import { useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react'
import { gsap } from '../lib/anim'

/**
 * Scoped GSAP context — all tweens created inside `cb` are reverted
 * automatically on unmount or dependency change. Mirrors @gsap/react's useGSAP.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  cb: (ctx: { scope: T | null; self: gsap.Context }) => void,
  deps: DependencyList = [],
): RefObject<T> {
  const scope = useRef<T>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context((self) => cb({ scope: scope.current, self }), scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scope
}

/** Run a one-shot animation whenever `value` changes (skips first render). */
export function useOnChange<V>(value: V, fn: (next: V, prev: V) => void) {
  const prev = useRef(value)
  const first = useRef(true)
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      prev.current = value
      return
    }
    if (prev.current !== value) {
      fn(value, prev.current)
      prev.current = value
    }
  }, [value])
}
