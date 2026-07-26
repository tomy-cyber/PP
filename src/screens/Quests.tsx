import { useEffect, useRef, useState } from 'react'
import { useStore, ACHIEVEMENTS, achievementTier } from '../store/useStore'
import { Button } from '../components/Button'
import { RewardModal } from '../components/RewardModal'
import { gsap, staggerIn, screenIn, wobble, flyTo, pop, EASE } from '../lib/anim'
import { useGsap } from '../hooks/useGsap'
import { haptic } from '../lib/haptics'

export function Quests() {
  const store = useStore()
  const { quests, claimQuest, eventEndsAt, streak, streakFreezes } = store
  const [claimed, setClaimed] = useState<number | null>(null)
  const [left, setLeft] = useState('')

  const scope = useGsap(() => {
    screenIn(scope.current)
    staggerIn('[data-quest]')
    gsap.from('[data-ach]', { scale: 0.9, opacity: 0, stagger: 0.05, duration: 0.45, ease: EASE.snap, delay: 0.2 })
  }, [])

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, eventEndsAt - Date.now())
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      setLeft(`${h}h ${String(m).padStart(2, '0')}m`)
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [eventEndsAt])

  return (
    <div ref={scope} className="flex-1 overflow-y-auto no-scrollbar px-4 pb-10 pt-4">
      {/* streak banner */}
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-4"
        style={{ background: 'linear-gradient(120deg,#FF9600,#FFC800)' }}
      >
        <span className="flame-glow text-[38px]">🔥</span>
        <div className="flex-1 text-white">
          <div className="font-display text-[22px] leading-none">{streak} day streak</div>
          <div className="font-sans text-[12px] font-bold opacity-90">
            {streakFreezes} streak freeze{streakFreezes === 1 ? '' : 's'} in reserve
          </div>
        </div>
      </div>

      {/* daily quests */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-[20px] text-eel">Daily quests</h2>
        <span className="chip bg-polar text-wolf">⏳ {left} left</span>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {quests.map((q) => (
          <QuestRow
            key={q.id}
            quest={q}
            onClaim={(el) => {
              const coins = claimQuest(q.id)
              if (!coins) return
              haptic.success()
              const target = document.getElementById('coin-target')
              flyTo(el, target, { emoji: '🪙', count: 9 })
              setClaimed(coins)
            }}
          />
        ))}
      </div>

      {/* achievements */}
      <h2 className="mt-8 font-display text-[20px] text-eel">Achievements</h2>
      <div className="mt-3 flex flex-col gap-3">
        {ACHIEVEMENTS.map((a) => {
          const { tier, next, pct, value } = achievementTier(a, store)
          const maxed = tier >= a.tiers.length
          return (
            <div key={a.id} data-ach className="card-soft flex items-center gap-3 px-4 py-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[24px]"
                style={{ background: maxed ? '#FFC800' : tier > 0 ? '#DDF4FF' : '#F0F0F0' }}
              >
                <span className={tier === 0 ? 'grayscale opacity-50' : ''}>{a.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-display text-[15px] text-eel">
                    {a.title} {tier > 0 && <span className="text-hare">· Lv {tier}</span>}
                  </span>
                  <span className="shrink-0 font-sans text-[12px] font-bold text-hare">
                    {maxed ? 'MAX' : `${Math.min(value, next)}/${next}`}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-swan">
                  <div
                    className="h-full rounded-full bg-bee"
                    style={{ width: `${Math.round(pct * 100)}%` }}
                  />
                </div>
                <div className="mt-1 font-sans text-[11px] font-bold text-hare">
                  {a.desc.replace('{n}', String(next))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <RewardModal
        open={claimed !== null}
        icon="🎯"
        title="Quest complete!"
        subtitle="Keep going to finish them all"
        coins={claimed ?? 0}
        onClose={() => setClaimed(null)}
      />
    </div>
  )
}

function QuestRow({
  quest,
  onClaim,
}: {
  quest: ReturnType<typeof useStore.getState>['quests'][number]
  onClaim: (el: HTMLElement | null) => void
}) {
  const row = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const ready = quest.progress >= quest.goal && !quest.claimed
  const pct = Math.round((quest.progress / quest.goal) * 100)

  useEffect(() => {
    gsap.to(fill.current, { width: `${pct}%`, duration: 0.7, ease: 'power3.out' })
  }, [pct])

  useEffect(() => {
    if (ready) {
      wobble(row.current)
      pop(row.current?.querySelector('[data-quest-icon]'), 1.2)
    }
  }, [ready])

  return (
    <div
      ref={row}
      data-quest
      className={`card-soft flex items-center gap-3 px-4 py-3 ${
        quest.claimed ? 'opacity-50' : ''
      }`}
      style={ready ? { borderColor: '#FFC800', borderBottomColor: '#E5A400' } : undefined}
    >
      <div data-quest-icon className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-polar text-[24px]">
        {quest.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-display text-[15px] text-eel">{quest.title}</span>
          <span className="shrink-0 font-sans text-[12px] font-bold text-hare">
            {Math.min(quest.progress, quest.goal)}/{quest.goal}
          </span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-swan">
          <div ref={fill} className="h-full rounded-full bg-feather" style={{ width: 0 }} />
        </div>
        <div className="mt-1 font-sans text-[11px] font-bold text-fox">
          🪙 {quest.reward} · ⚡ {quest.xpReward} XP
        </div>
      </div>
      {ready ? (
        <Button size="sm" variant="gold" onClick={() => onClaim(row.current)}>
          Claim
        </Button>
      ) : quest.claimed ? (
        <span className="text-[22px]">✅</span>
      ) : null}
    </div>
  )
}
