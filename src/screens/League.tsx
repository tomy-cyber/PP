import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useStore, useLeaderboard, LEAGUES } from '../store/useStore'
import { gsap, staggerIn, screenIn, Flip, pulse, EASE } from '../lib/anim'
import { useGsap } from '../hooks/useGsap'
import { haptic } from '../lib/haptics'

const MEDALS = ['🥇', '🥈', '🥉']

export function League() {
  const { leagueIndex, weekXp } = useStore()
  const board = useLeaderboard()
  const league = LEAGUES[leagueIndex]
  const [tab, setTab] = useState<'league' | 'friends'>('league')
  const listRef = useRef<HTMLDivElement>(null)
  const badge = useRef<HTMLDivElement>(null)

  const scope = useGsap(() => {
    screenIn(scope.current)
    staggerIn('[data-row]', { stagger: 0.04 })
    pulse(badge.current, 1.06, 1.4)
    gsap.from('[data-league-pip]', {
      scale: 0,
      opacity: 0,
      stagger: 0.06,
      duration: 0.5,
      ease: EASE.snap,
      delay: 0.15,
    })
  }, [tab])

  // simulate rivals gaining XP → animated rank reshuffle via Flip
  useEffect(() => {
    const id = setInterval(() => {
      const state = Flip.getState('[data-row]')
      useStore.setState((s) => ({
        friends: s.friends.map((f) =>
          Math.random() > 0.72 ? { ...f, xpWeek: f.xpWeek + Math.round(Math.random() * 25) } : f,
        ),
      }))
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.7,
          ease: 'power2.inOut',
          absolute: true,
          stagger: 0.02,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.3 }),
        })
      })
    }, 6000)
    return () => clearInterval(id)
  }, [])

  const rows = tab === 'friends' ? board.filter((b) => b.isYou || b.id.startsWith('f') || b.id.startsWith('r')) : board

  return (
    <div ref={scope} className="flex-1 overflow-y-auto no-scrollbar px-4 pb-10 pt-4">
      {/* league header */}
      <div className="flex flex-col items-center">
        <div ref={badge} className="text-[62px] leading-none">
          {league.icon}
        </div>
        <h1 className="mt-2 font-display text-[24px]" style={{ color: league.color }}>
          {league.name} League
        </h1>
        <p className="mt-1 font-sans text-[13px] font-bold text-wolf">
          Top 5 advance · {weekXp} XP this week
        </p>

        <div className="mt-4 flex items-center gap-1.5">
          {LEAGUES.map((l, i) => (
            <div
              key={l.id}
              data-league-pip
              className={`grid h-8 w-8 place-items-center rounded-full text-[15px] ${
                i === leagueIndex ? 'ring-2 ring-offset-2' : i < leagueIndex ? '' : 'grayscale opacity-35'
              }`}
              style={
                {
                  background: i <= leagueIndex ? l.color + '22' : '#F0F0F0',
                  '--tw-ring-color': l.color,
                } as CSSProperties
              }
            >
              {l.icon}
            </div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div className="mt-6 flex rounded-2xl bg-polar p-1">
        {(['league', 'friends'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              haptic.tap()
              setTab(t)
            }}
            className={`flex-1 rounded-xl py-2.5 font-display text-[13px] uppercase tracking-wide ${
              tab === t ? 'bg-white text-macaw shadow-sm' : 'text-hare'
            }`}
          >
            {t === 'league' ? 'Leaderboard' : 'Friends'}
          </button>
        ))}
      </div>

      {/* rows */}
      <div ref={listRef} className="mt-4 flex flex-col gap-2">
        {rows.map((f, i) => {
          const promo = i < 5
          const demo = i >= rows.length - 2
          return (
            <div
              key={f.id}
              data-row
              data-flip-id={f.id}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                f.isYou ? 'bg-[#DDF4FF] ring-2 ring-macaw' : 'bg-white'
              }`}
            >
              <span
                className={`w-7 text-center font-display text-[16px] ${
                  promo ? 'text-feather' : demo ? 'text-cardinal' : 'text-hare'
                }`}
              >
                {i < 3 ? MEDALS[i] : i + 1}
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-polar text-[22px]">
                {f.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[15px] text-eel">
                  {f.name} {f.isYou && <span className="text-macaw">(you)</span>}
                </div>
                <div className="font-sans text-[11px] font-bold text-hare">🔥 {f.streak} day streak</div>
              </div>
              <span className="font-display text-[15px] text-bee-dark">{f.xpWeek} XP</span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-polar px-4 py-3 text-center font-sans text-[12px] font-bold text-wolf">
        Rankings update live. Finish top 5 to be promoted to{' '}
        {LEAGUES[Math.min(LEAGUES.length - 1, leagueIndex + 1)].name}.
      </div>
    </div>
  )
}
