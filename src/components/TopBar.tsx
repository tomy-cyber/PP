import { useRef } from 'react'
import { useStore, LEAGUES, MAX_HEARTS } from '../store/useStore'
import { Counter } from './Counter'
import { pulse, wobble, gsap } from '../lib/anim'
import { useGsap } from '../hooks/useGsap'
import { haptic } from '../lib/haptics'

interface Props {
  onCourse?: () => void
  onStreak?: () => void
  onCoins?: () => void
  onHearts?: () => void
}

export function TopBar({ onCourse, onStreak, onCoins, onHearts }: Props) {
  const { courseId, streak, coins, hearts, leagueIndex } = useStore()
  const flame = useRef<HTMLSpanElement>(null)
  const league = LEAGUES[leagueIndex]

  const course = useStore((s) => s.courseId)
  const flag = { money: '💰', trivia: '🧠', sandbox: '🧩' }[course] ?? '📘'

  const scope = useGsap(() => {
    if (streak > 0 && flame.current) pulse(flame.current, 1.14, 0.85)
    gsap.from('[data-topbar-item]', {
      y: -14,
      opacity: 0,
      duration: 0.45,
      stagger: 0.06,
      ease: 'power3.out',
    })
  }, [courseId])

  return (
    <div
      ref={scope}
      className="safe-top sticky top-0 z-30 flex items-center justify-between gap-2 border-b-2 border-swan bg-white px-4 pb-3"
    >
      <button
        data-topbar-item
        onClick={() => {
          haptic.tap()
          onCourse?.()
        }}
        className="text-[26px] leading-none"
      >
        {flag}
      </button>

      <button
        data-topbar-item
        onClick={() => {
          haptic.tap()
          onCoins?.()
        }}
        className="flex items-center gap-1"
      >
        <span className="text-[20px]">{league.icon}</span>
      </button>

      <button
        data-topbar-item
        onClick={() => {
          haptic.tap()
          wobble(flame.current)
          onStreak?.()
        }}
        className="flex items-center gap-1"
      >
        <span ref={flame} className={`text-[22px] ${streak > 0 ? 'flame-glow' : 'grayscale opacity-50'}`}>
          🔥
        </span>
        <Counter value={streak} className="font-display text-[19px] text-fox" celebrate />
      </button>

      <button
        data-topbar-item
        onClick={() => {
          haptic.tap()
          onCoins?.()
        }}
        className="flex items-center gap-1"
      >
        <span className="text-[20px]">🪙</span>
        <Counter id="coin-target" value={coins} className="font-display text-[19px] text-bee-dark" celebrate />
      </button>

      <button
        data-topbar-item
        onClick={() => {
          haptic.tap()
          onHearts?.()
        }}
        className="flex items-center gap-1"
      >
        <span className={`text-[20px] ${hearts === 0 ? 'grayscale' : ''}`}>❤️</span>
        <span className="font-display text-[19px] text-cardinal">
          {hearts >= MAX_HEARTS ? '∞' : hearts}
        </span>
      </button>
    </div>
  )
}
