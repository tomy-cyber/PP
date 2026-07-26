import { useState } from 'react'
import {
  useStore,
  levelFromXp,
  levelProgress,
  ACHIEVEMENTS,
  achievementTier,
  XP_PER_LEVEL,
} from '../store/useStore'
import { COURSES } from '../data/content'
import { Button } from '../components/Button'
import { Sheet } from '../components/Sheet'
import { Counter } from '../components/Counter'
import { gsap, staggerIn, screenIn, orbit, EASE } from '../lib/anim'
import { useGsap } from '../hooks/useGsap'
import { haptic } from '../lib/haptics'

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🦉', '🐙', '🦄', '🐧', '🐨', '🦈', '🐝', '🦖']

export function Profile() {
  const store = useStore()
  const { name, avatar, xp, streak, bestStreak, totalLessons, perfectLessons, friends, courseId, dailyGoal } = store
  const [edit, setEdit] = useState(false)
  const [courses, setCourses] = useState(false)
  const [draftName, setDraftName] = useState(name)

  const level = levelFromXp(xp)
  const pct = Math.round(levelProgress(xp) * 100)
  const unlocked = ACHIEVEMENTS.filter((a) => achievementTier(a, store).tier > 0)

  const scope = useGsap(() => {
    screenIn(scope.current)
    orbit('[data-ring]', 12)
    staggerIn('[data-stat]', { stagger: 0.05 })
    gsap.from('[data-avatar]', { scale: 0.5, opacity: 0, duration: 0.7, ease: EASE.snap })
    gsap.to('[data-level-fill]', { width: `${pct}%`, duration: 1, ease: 'power3.out', delay: 0.25 })
  }, [])

  const stats = [
    { icon: '🔥', label: 'Day streak', value: streak },
    { icon: '⚡', label: 'Total XP', value: xp },
    { icon: '📘', label: 'Lessons', value: totalLessons },
    { icon: '🎯', label: 'Perfect', value: perfectLessons },
    { icon: '🏅', label: 'Best streak', value: bestStreak },
    { icon: '🤝', label: 'Friends', value: friends.length },
  ]

  return (
    <div ref={scope} className="flex-1 overflow-y-auto no-scrollbar px-4 pb-10 pt-6">
      {/* header */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            data-ring
            className="absolute -inset-3 rounded-full opacity-60"
            style={{
              background: 'conic-gradient(from 0deg,#58CC02,#1CB0F6,#CE82FF,#FFC800,#58CC02)',
            }}
          />
          <div
            data-avatar
            className="relative grid h-24 w-24 place-items-center rounded-full bg-white text-[52px]"
          >
            {avatar}
          </div>
        </div>

        <h1 className="mt-4 font-display text-[24px] text-eel">{name}</h1>
        <p className="font-sans text-[12px] font-bold text-hare">
          Joined {new Date(store.joinedAt).toLocaleDateString()} · Goal {dailyGoal} XP/day
        </p>

        <div className="mt-4 w-full max-w-xs">
          <div className="flex items-center justify-between font-display text-[12px] uppercase tracking-wide text-wolf">
            <span>Level {level}</span>
            <span>
              {xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP
            </span>
          </div>
          <div className="mt-1.5 h-3.5 overflow-hidden rounded-full bg-swan">
            <div data-level-fill className="h-full rounded-full bg-beetle" style={{ width: 0 }} />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEdit(true)}>
            Edit profile
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setCourses(true)}>
            Switch course
          </Button>
        </div>
      </div>

      {/* stats */}
      <h2 className="mt-8 font-display text-[19px] text-eel">Statistics</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} data-stat className="card-soft flex items-center gap-3 px-3 py-3">
            <span className="text-[24px]">{s.icon}</span>
            <div>
              <div className="font-display text-[18px] text-eel">
                <Counter value={s.value} />
              </div>
              <div className="font-sans text-[11px] font-bold text-hare">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* achievements */}
      <h2 className="mt-8 font-display text-[19px] text-eel">
        Achievements <span className="text-hare">({unlocked.length}/{ACHIEVEMENTS.length})</span>
      </h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {ACHIEVEMENTS.map((a) => {
          const { tier } = achievementTier(a, store)
          return (
            <div
              key={a.id}
              data-stat
              className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-swan bg-white"
              style={{ borderBottomWidth: 4, opacity: tier ? 1 : 0.4 }}
            >
              <span className={`text-[28px] ${tier ? '' : 'grayscale'}`}>{a.icon}</span>
            </div>
          )
        })}
      </div>

      {/* friends */}
      <h2 className="mt-8 font-display text-[19px] text-eel">Friends</h2>
      <div className="mt-3 flex flex-col gap-2">
        {friends.slice(0, 8).map((f) => (
          <div key={f.id} data-stat className="flex items-center gap-3 rounded-2xl bg-polar px-3 py-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[22px]">
              {f.avatar}
            </span>
            <div className="flex-1">
              <div className="font-display text-[15px] text-eel">{f.name}</div>
              <div className="font-sans text-[11px] font-bold text-hare">
                🔥 {f.streak} · ⚡ {f.xpWeek} XP this week
              </div>
            </div>
            <span className="chip bg-white text-macaw">Following</span>
          </div>
        ))}
      </div>

      <Button
        variant="red"
        full
        size="md"
        className="mt-8"
        onClick={() => {
          haptic.heavy()
          if (confirm('Reset all progress?')) store.reset()
        }}
      >
        Reset progress
      </Button>

      {/* ---------- edit sheet ---------- */}
      <Sheet open={edit} onClose={() => setEdit(false)}>
        <h2 className="font-display text-[22px] text-eel">Edit profile</h2>
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className="mt-4 w-full rounded-2xl border-2 border-swan px-4 py-3 font-sans text-[15px] font-bold text-eel outline-none focus:border-macaw"
          style={{ borderBottomWidth: 4 }}
        />
        <div className="mt-4 grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => {
                haptic.tap()
                useStore.setState({ avatar: a })
              }}
              className={`grid h-12 place-items-center rounded-xl border-2 text-[24px] ${
                avatar === a ? 'border-macaw bg-[#DDF4FF]' : 'border-swan bg-white'
              }`}
              style={{ borderBottomWidth: 4 }}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="mt-5">
          <div className="font-display text-[13px] uppercase tracking-wide text-wolf">Daily goal</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[20, 50, 100, 200].map((g) => (
              <button
                key={g}
                onClick={() => {
                  haptic.tap()
                  useStore.setState({ dailyGoal: g })
                }}
                className={`rounded-xl border-2 py-2.5 font-display text-[14px] ${
                  dailyGoal === g ? 'border-feather bg-[#D7FFB8] text-feather-dark' : 'border-swan bg-white text-eel'
                }`}
                style={{ borderBottomWidth: 4 }}
              >
                {g} XP
              </button>
            ))}
          </div>
        </div>
        <Button
          variant="green"
          full
          size="lg"
          className="mt-6"
          onClick={() => {
            useStore.setState({ name: draftName.trim() || 'You' })
            setEdit(false)
          }}
        >
          Save
        </Button>
      </Sheet>

      {/* ---------- course sheet ---------- */}
      <Sheet open={courses} onClose={() => setCourses(false)}>
        <h2 className="font-display text-[22px] text-eel">Choose a course</h2>
        <div className="mt-4 flex flex-col gap-3">
          {COURSES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                haptic.tap()
                useStore.setState({ courseId: c.id })
                setCourses(false)
              }}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${
                courseId === c.id ? 'border-feather bg-[#D7FFB8]' : 'border-swan bg-white'
              }`}
              style={{ borderBottomWidth: 4 }}
            >
              <span className="text-[30px]">{c.flag}</span>
              <div className="flex-1">
                <div className="font-display text-[16px] text-eel">{c.name}</div>
                <div className="font-sans text-[12px] font-bold text-hare">{c.blurb}</div>
              </div>
              {courseId === c.id && <span className="text-[18px]">✅</span>}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
