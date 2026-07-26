import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore, useRecommendation } from '../store/useStore'
import { findCourse, allLessons, type Lesson } from '../data/content'
import { PathNode } from '../components/PathNode'
import { Button } from '../components/Button'
import { Mascot } from '../components/Mascot'
import { gsap, staggerIn, screenIn, wobble, EASE } from '../lib/anim'
import { useGsap } from '../hooks/useGsap'
import { haptic } from '../lib/haptics'

const OFFSETS = [0, 42, 68, 42, 0, -42, -68, -42]

const UNIT_BG: Record<string, string> = {
  feather: '#58CC02',
  macaw: '#1CB0F6',
  bee: '#FFC800',
  beetle: '#CE82FF',
  fox: '#FF9600',
  cardinal: '#FF4B4B',
}

export function Learn({ onStart }: { onStart: (lesson: Lesson, color: string) => void }) {
  const { courseId, progress, dailyGoal, xp, eventEndsAt } = useStore()
  const course = findCourse(courseId)
  const rec = useRecommendation()
  const [left, setLeft] = useState('')

  const flat = useMemo(() => allLessons(courseId), [courseId])
  const activeId = flat.find((l) => !progress[l.lesson.id])?.lesson.id ?? null

  const todayXp = Math.min(dailyGoal, xp % (dailyGoal * 4)) // illustrative daily ring
  const goalPct = Math.round((todayXp / dailyGoal) * 100)

  const scope = useGsap(() => {
    screenIn(scope.current)
    staggerIn('[data-path-node]', { stagger: 0.035, duration: 0.45 })
    gsap.from('[data-unit-header]', { y: -18, opacity: 0, stagger: 0.12, duration: 0.5 })
    gsap.fromTo(
      '[data-rec-card]',
      { y: 24, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: EASE.pop, delay: 0.1 },
    )
    gsap.to('[data-goal-fill]', { width: `${goalPct}%`, duration: 1, ease: 'power3.out', delay: 0.3 })
  }, [courseId])

  // FOMO countdown
  const fomo = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, eventEndsAt - Date.now())
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setLeft(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [eventEndsAt])

  useEffect(() => {
    const id = setInterval(() => wobble(fomo.current), 6000)
    return () => clearInterval(id)
  }, [])

  return (
    <div ref={scope} className="flex-1 overflow-y-auto no-scrollbar pb-8">
      {/* ---- Daily goal ring + FOMO event ---- */}
      <div className="px-4 pt-4">
        <div className="card-soft flex items-center gap-3 px-4 py-3">
          <div className="text-[26px]">🎯</div>
          <div className="flex-1">
            <div className="font-display text-[13px] uppercase tracking-wide text-wolf">
              Daily goal · {todayXp}/{dailyGoal} XP
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-swan">
              <div data-goal-fill className="h-full rounded-full bg-bee" style={{ width: 0 }} />
            </div>
          </div>
        </div>

        <div
          ref={fomo}
          className="mt-3 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'linear-gradient(100deg,#FF9600,#FF4B4B)' }}
        >
          <span className="text-[24px]">⚡</span>
          <div className="flex-1 text-white">
            <div className="font-display text-[14px] uppercase leading-tight">Double coins event</div>
            <div className="font-sans text-[12px] font-bold opacity-90">Ends in {left}</div>
          </div>
          <span className="chip bg-white/25 text-white">2×</span>
        </div>
      </div>

      {/* ---- Curiosity: what's new today ---- */}
      {rec && (
        <div data-rec-card className="px-4 pt-4">
          <div className="card-soft overflow-hidden">
            <div className="flex items-center gap-2 border-b-2 border-swan px-4 py-2">
              <span className="text-[15px]">✨</span>
              <span className="font-display text-[12px] uppercase tracking-wide text-beetle">
                See what's new today
              </span>
            </div>
            <div className="px-4 py-4">
              <Mascot
                size={54}
                mood={rec.kind === 'review' ? 'think' : 'happy'}
                say={`${rec.reason} — ${rec.lesson.title}`}
              />
              <Button
                variant={rec.kind === 'review' ? 'purple' : 'green'}
                full
                className="mt-4"
                onClick={() => {
                  const unit = course.units.find((u) => u.lessons.some((l) => l.id === rec.lesson.id))
                  onStart(rec.lesson, unit?.color ?? 'feather')
                }}
              >
                {rec.kind === 'review' ? 'Practice' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---- The path ---- */}
      {course.units.map((unit) => {
        const bg = UNIT_BG[unit.color]
        return (
          <div key={unit.id} className="mt-6">
            <div
              data-unit-header
              className="sticky top-0 z-20 mx-4 flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: bg }}
            >
              <div className="text-white">
                <div className="font-display text-[12px] uppercase tracking-widest opacity-80">
                  {unit.title}
                </div>
                <div className="font-display text-[17px] leading-tight">{unit.subtitle}</div>
              </div>
              <button
                onClick={() => haptic.tap()}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white"
              >
                📖
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              {unit.lessons.map((lesson, i) => {
                const done = !!progress[lesson.id]
                const state = done ? 'done' : lesson.id === activeId ? 'active' : 'locked'
                return (
                  <PathNode
                    key={lesson.id}
                    lesson={lesson}
                    color={unit.color}
                    state={state}
                    stars={progress[lesson.id]?.stars ?? 0}
                    offset={OFFSETS[i % OFFSETS.length]}
                    onPress={() => onStart(lesson, unit.color)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="mt-10 px-6 text-center font-sans text-[13px] font-bold text-hare">
        More units unlock as you go 🚀
      </div>
    </div>
  )
}
