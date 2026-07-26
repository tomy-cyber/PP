import { useEffect, useRef } from 'react'
import { gsap, EASE } from '../lib/anim'
import { haptic } from '../lib/haptics'
import { useStore } from '../store/useStore'

export type Tab = 'learn' | 'quests' | 'league' | 'wallet' | 'profile'

const TABS: { id: Tab; icon: string; label: string; color: string }[] = [
  { id: 'learn', icon: '🏠', label: 'Learn', color: '#58CC02' },
  { id: 'quests', icon: '🎯', label: 'Quests', color: '#FF9600' },
  { id: 'league', icon: '🏆', label: 'League', color: '#FFC800' },
  { id: 'wallet', icon: '💵', label: 'Wallet', color: '#1CB0F6' },
  { id: 'profile', icon: '👤', label: 'You', color: '#CE82FF' },
]

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const bar = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLDivElement>(null)
  const quests = useStore((s) => s.quests)
  const claimable = quests.filter((q) => !q.claimed && q.progress >= q.goal).length

  useEffect(() => {
    const idx = TABS.findIndex((t) => t.id === tab)
    const btn = bar.current?.querySelectorAll<HTMLElement>('[data-tab]')[idx]
    if (!btn || !pill.current) return
    gsap.to(pill.current, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      backgroundColor: TABS[idx].color + '22',
      borderColor: TABS[idx].color,
      duration: 0.42,
      ease: EASE.pop,
    })
    gsap.fromTo(
      btn.querySelector('[data-icon]'),
      { scale: 0.7, y: 4 },
      { scale: 1, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.5)' },
    )
  }, [tab])

  useEffect(() => {
    gsap.from(bar.current, { yPercent: 120, duration: 0.5, ease: EASE.pop, delay: 0.1 })
  }, [])

  return (
    <div
      ref={bar}
      className="safe-bottom relative z-30 flex items-stretch justify-between border-t-2 border-swan bg-white px-2 pt-2"
    >
      <div
        ref={pill}
        className="pointer-events-none absolute left-0 top-2 h-[52px] rounded-2xl border-2"
        style={{ width: 0 }}
      />
      {TABS.map((t) => (
        <button
          key={t.id}
          data-tab={t.id}
          onClick={() => {
            haptic.tap()
            onChange(t.id)
          }}
          className="relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        >
          <span data-icon className="text-[24px] leading-none">
            {t.icon}
          </span>
          <span
            className={`font-display text-[10px] uppercase tracking-wide ${
              tab === t.id ? 'opacity-100' : 'opacity-45'
            }`}
            style={{ color: tab === t.id ? t.color : '#777' }}
          >
            {t.label}
          </span>
          {t.id === 'quests' && claimable > 0 && (
            <span className="absolute right-3 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-cardinal px-1 font-display text-[10px] text-white">
              {claimable}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
