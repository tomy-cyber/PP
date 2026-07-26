import { useEffect, useRef } from 'react'
import { gsap, pressIn, pressOut, EASE } from '../lib/anim'
import { haptic } from '../lib/haptics'
import type { Lesson } from '../data/content'

const PALETTE: Record<string, { face: string; shadow: string }> = {
  feather: { face: '#58CC02', shadow: '#46A302' },
  macaw: { face: '#1CB0F6', shadow: '#1899D6' },
  bee: { face: '#FFC800', shadow: '#E5A400' },
  beetle: { face: '#CE82FF', shadow: '#A560E8' },
  fox: { face: '#FF9600', shadow: '#E08600' },
  cardinal: { face: '#FF4B4B', shadow: '#EA2B2B' },
  locked: { face: '#E5E5E5', shadow: '#CFCFCF' },
}

interface Props {
  lesson: Lesson
  color: string
  state: 'locked' | 'active' | 'done'
  stars: number
  offset: number
  onPress: () => void
}

export function PathNode({ lesson, color, state, stars, offset, onPress }: Props) {
  const btn = useRef<HTMLButtonElement>(null)
  const halo = useRef<HTMLDivElement>(null)
  const bubble = useRef<HTMLDivElement>(null)

  const pal = state === 'locked' ? PALETTE.locked : PALETTE[color] ?? PALETTE.feather

  useEffect(() => {
    if (state !== 'active') return
    const ctx = gsap.context(() => {
      gsap.to(btn.current, {
        y: -6,
        duration: 0.85,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      if (halo.current) {
        gsap.fromTo(
          halo.current,
          { scale: 0.85, opacity: 0.5 },
          { scale: 1.5, opacity: 0, duration: 1.6, repeat: -1, ease: 'power2.out' },
        )
      }
      if (bubble.current) {
        gsap.fromTo(
          bubble.current,
          { scale: 0.6, opacity: 0, y: 8 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: EASE.snap, delay: 0.25 },
        )
      }
    })
    return () => ctx.revert()
  }, [state])

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ transform: `translateX(${offset}px)` }}
      data-path-node
    >
      {state === 'active' && (
        <div
          ref={bubble}
          className="absolute -top-[52px] whitespace-nowrap rounded-2xl border-2 border-swan bg-white px-4 py-1.5 font-display text-[13px] uppercase text-feather"
          style={{ borderBottomWidth: 4 }}
        >
          Start
          <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-swan bg-white" />
        </div>
      )}

      {state === 'active' && (
        <div
          ref={halo}
          className="pointer-events-none absolute top-1 h-[74px] w-[74px] rounded-full"
          style={{ background: pal.face, opacity: 0.35 }}
        />
      )}

      <button
        ref={btn}
        disabled={state === 'locked'}
        onPointerDown={() => state !== 'locked' && pressIn(btn.current)}
        onPointerUp={() => pressOut(btn.current)}
        onPointerLeave={() => pressOut(btn.current)}
        onClick={() => {
          if (state === 'locked') {
            haptic.error()
            gsap.fromTo(btn.current, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,0.3)' })
            return
          }
          haptic.medium()
          onPress()
        }}
        className="relative grid h-[66px] w-[74px] place-items-center rounded-full"
        style={{
          background: pal.face,
          boxShadow: `0 8px 0 0 ${pal.shadow}`,
        }}
      >
        <span className={`text-[28px] ${state === 'locked' ? 'opacity-40 grayscale' : ''}`}>
          {state === 'locked' ? '🔒' : lesson.icon}
        </span>
      </button>

      {state === 'done' && (
        <div className="mt-3 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`text-[11px] ${i < stars ? '' : 'opacity-25 grayscale'}`}>
              ⭐
            </span>
          ))}
        </div>
      )}
      {state !== 'done' && <div className="h-[22px]" />}
    </div>
  )
}
