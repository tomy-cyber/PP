import { useEffect, useRef, useState } from 'react'
import { useStore, MAX_HEARTS } from './store/useStore'
import type { Lesson } from './data/content'
import { TopBar } from './components/TopBar'
import { BottomNav, type Tab } from './components/BottomNav'
import { Sheet } from './components/Sheet'
import { Button } from './components/Button'
import { Mascot } from './components/Mascot'
import { Learn } from './screens/Learn'
import { Quests } from './screens/Quests'
import { League } from './screens/League'
import { Wallet } from './screens/Wallet'
import { Profile } from './screens/Profile'
import { LessonPlayer } from './screens/LessonPlayer'
import { Onboarding } from './screens/Onboarding'
import { gsap, EASE, pulse } from './lib/anim'
import { haptic } from './lib/haptics'

export default function App() {
  const { onboarded, init, hearts, streak, bestStreak, coins, buyWithCoins, refillHearts } = useStore()
  const [tab, setTab] = useState<Tab>('learn')
  const [active, setActive] = useState<{ lesson: Lesson; color: string } | null>(null)
  const [heartSheet, setHeartSheet] = useState(false)
  const [streakSheet, setStreakSheet] = useState(false)
  const overlay = useRef<HTMLDivElement>(null)
  const flame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    init()
    const onVis = () => document.visibilityState === 'visible' && init()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [init])

  // lesson overlay transition
  useEffect(() => {
    if (!overlay.current) return
    if (active) {
      gsap.fromTo(
        overlay.current,
        { yPercent: 100, opacity: 0.6 },
        { yPercent: 0, opacity: 1, duration: 0.45, ease: EASE.pop },
      )
    }
  }, [active])

  useEffect(() => {
    if (streakSheet) pulse(flame.current, 1.12, 0.9)
  }, [streakSheet])

  const closeLesson = () => {
    if (!overlay.current) return setActive(null)
    gsap.to(overlay.current, {
      yPercent: 100,
      duration: 0.32,
      ease: 'power2.in',
      onComplete: () => setActive(null),
    })
  }

  const startLesson = (lesson: Lesson, color: string) => {
    if (hearts <= 0 && lesson.type !== 'chest') {
      haptic.error()
      setHeartSheet(true)
      return
    }
    setActive({ lesson, color })
  }

  if (!onboarded) return <Onboarding onDone={() => setTab('learn')} />

  return (
    <div className="relative flex h-full flex-col bg-white">
      <TopBar
        onStreak={() => setStreakSheet(true)}
        onHearts={() => setHeartSheet(true)}
        onCoins={() => setTab('wallet')}
        onCourse={() => setTab('profile')}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {tab === 'learn' && <Learn onStart={startLesson} />}
        {tab === 'quests' && <Quests />}
        {tab === 'league' && <League />}
        {tab === 'wallet' && <Wallet />}
        {tab === 'profile' && <Profile />}
      </div>

      <BottomNav tab={tab} onChange={setTab} />

      {/* ---------- lesson overlay ---------- */}
      {active && (
        <div ref={overlay} className="fixed inset-0 z-40 bg-white">
          <LessonPlayer
            lesson={active.lesson}
            color={active.color}
            onExit={closeLesson}
            onDone={closeLesson}
          />
        </div>
      )}

      {/* ---------- hearts ---------- */}
      <Sheet open={heartSheet} onClose={() => setHeartSheet(false)}>
        <div className="text-center">
          <div className="text-[52px]">{hearts > 0 ? '❤️' : '💔'}</div>
          <h2 className="mt-2 font-display text-[22px] text-eel">
            {hearts}/{MAX_HEARTS} hearts
          </h2>
          <p className="mt-1 font-sans text-[13px] font-bold text-wolf">
            {hearts > 0
              ? 'You lose a heart for each wrong answer. They refill over time.'
              : 'Out of hearts! Refill to keep learning.'}
          </p>
        </div>
        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <span key={i} className={`text-[26px] ${i < hearts ? '' : 'grayscale opacity-30'}`}>
              ❤️
            </span>
          ))}
        </div>
        <Button
          variant="gold"
          size="lg"
          full
          className="mt-6"
          disabled={hearts >= MAX_HEARTS || coins < 350}
          onClick={() => {
            if (buyWithCoins(350)) {
              refillHearts(true)
              haptic.success()
              setHeartSheet(false)
            }
          }}
        >
          {hearts >= MAX_HEARTS ? 'Hearts full' : 'Refill for 🪙 350'}
        </Button>
        <p className="mt-3 text-center font-sans text-[11px] font-bold text-hare">
          One heart regenerates every 30 minutes.
        </p>
      </Sheet>

      {/* ---------- streak ---------- */}
      <Sheet open={streakSheet} onClose={() => setStreakSheet(false)}>
        <div className="text-center">
          <div ref={flame} className="flame-glow text-[62px]">
            🔥
          </div>
          <h2 className="mt-2 font-display text-[30px] text-fox">{streak}</h2>
          <p className="font-display text-[14px] uppercase tracking-wide text-wolf">day streak</p>
        </div>

        <div className="mt-6 flex justify-between px-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
            const on = i < Math.min(7, streak)
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="font-display text-[11px] text-hare">{d}</span>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-[16px] ${
                    on ? 'bg-fox text-white' : 'bg-polar text-hare'
                  }`}
                >
                  {on ? '🔥' : '·'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-6">
          <Mascot size={52} say={`Personal best: ${bestStreak} days. Don't break the chain!`} />
        </div>

        <Button variant="green" size="lg" full className="mt-6" onClick={() => setStreakSheet(false)}>
          Keep it going
        </Button>
      </Sheet>
    </div>
  )
}
