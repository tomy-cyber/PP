import { useRef } from 'react'
import { countTo, pop } from '../lib/anim'
import { useOnChange } from '../hooks/useGsap'

interface Props {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  /** pop the element when it changes */
  celebrate?: boolean
  id?: string
}

/** Number that rolls up with GSAP whenever the value changes. */
export function Counter({ value, prefix = '', suffix = '', decimals = 0, className, celebrate, id }: Props) {
  const el = useRef<HTMLSpanElement>(null)

  useOnChange(value, (next, prev) => {
    countTo(el.current, prev, next, { prefix, suffix, decimals, duration: 0.8 })
    if (celebrate && next > prev) pop(el.current, 1.25)
  })

  return (
    <span id={id} ref={el} className={className}>
      {prefix}
      {decimals ? value.toFixed(decimals) : value.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}
