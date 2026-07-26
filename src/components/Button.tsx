import { forwardRef, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { pressIn, pressOut, gsap } from '../lib/anim'
import { haptic } from '../lib/haptics'

type Variant = 'green' | 'blue' | 'red' | 'gold' | 'purple' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  children: ReactNode
  /** disable haptic + press animation (for row-like buttons handling their own) */
  raw?: boolean
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[13px] rounded-xl',
  md: 'px-5 py-3.5 text-[15px] rounded-2xl',
  lg: 'px-6 py-4 text-[17px] rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'green', size = 'md', full, className = '', children, raw, onClick, ...rest },
  ref,
) {
  const inner = useRef<HTMLButtonElement | null>(null)

  const setRef = (el: HTMLButtonElement | null) => {
    inner.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el
  }

  return (
    <button
      ref={setRef}
      className={`btn3d btn-${variant} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      onPointerDown={() => !raw && !rest.disabled && pressIn(inner.current)}
      onPointerUp={() => !raw && pressOut(inner.current)}
      onPointerLeave={() => !raw && pressOut(inner.current)}
      onClick={(e) => {
        if (rest.disabled) return
        haptic.tap()
        gsap.fromTo(
          inner.current,
          { scale: 0.95 },
          { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' },
        )
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </button>
  )
})

/** Circular icon button with the same 3D feel. */
export function IconButton({
  children,
  onClick,
  className = '',
  label,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  label?: string
}) {
  const el = useRef<HTMLButtonElement>(null)
  return (
    <button
      ref={el}
      aria-label={label}
      className={`grid h-10 w-10 place-items-center rounded-full ${className}`}
      onPointerDown={() => pressIn(el.current)}
      onPointerUp={() => pressOut(el.current)}
      onPointerLeave={() => pressOut(el.current)}
      onClick={() => {
        haptic.tap()
        onClick?.()
      }}
    >
      {children}
    </button>
  )
}
