import { useRef, useState } from 'react'
import { COURSES } from '../data/content'
import { useStore } from '../store/useStore'
import { Button } from '../components/Button'
import { Mascot } from '../components/Mascot'
import { gsap, staggerIn, confetti, EASE } from '../lib/anim'
import { useGsap } from '../hooks/useGsap'
import { haptic } from '../lib/haptics'

const INTERESTS = [
  { id: 'money', label: 'Money', icon: '💰' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'history', label: 'History', icon: '🏛️' },
  { id: 'geo', label: 'Geography', icon: '🌍' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'health', label: 'Health', icon: '🫀' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
]

const GOALS = [
  { xp: 20, label: 'Casual', time: '5 min / day' },
  { xp: 50, label: 'Regular', time: '10 min / day' },
  { xp: 100, label: 'Serious', time: '15 min / day' },
  { xp: 200, label: 'Intense', time: '30 min / day' },
]

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🦉', '🐙', '🦄', '🐧']

export function Onboarding({ onDone }: { onDone: () => void }) {
  const setOnboarded = useStore((s) => s.setOnboarded)
  const [step, setStep] = useState(0)
  const [courseId, setCourseId] = useState(COURSES[0].id)
  const [goal, setGoal] = useState(50)
  const [interests, setInterests] = useState<string[]>([])
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🦊')
  const host = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)

  const scope = useGsap(() => {
    gsap.fromTo(
      '[data-step]',
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
    )
    staggerIn('[data-ob-item]', { stagger: 0.05, duration: 0.4 })
    if (progress.current) {
      gsap.to(progress.current, {
        width: `${((step + 1) / 5) * 100}%`,
        duration: 0.6,
        ease: EASE.pop,
      })
    }
  }, [step])

  const next = () => {
    haptic.medium()
    if (step < 4) return setStep(step + 1)
    confetti(host.current, 60)
    setOnboarded({ courseId, dailyGoal: goal, interests, name: name.trim() || 'You', avatar })
    setTimeout(onDone, 700)
  }

  const canNext =
    step === 0 ? true : step === 1 ? !!courseId : step === 2 ? !!goal : step === 3 ? interests.length > 0 : true

  return (
    <div ref={host} className="relative flex h-full flex-col overflow-hidden bg-white">
      <div className="safe-top px-5 pb-2">
        <div className="h-3 overflow-hidden rounded-full bg-swan">
          <div ref={progress} className="h-full rounded-full bg-feather" style={{ width: '20%' }} />
        </div>
      </div>

      <div ref={scope} className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 pt-6">
        {step === 0 && (
          <div data-step className="flex h-full flex-col items-center justify-center text-center">
            <Mascot mood="cheer" size={110} />
            <h1 className="mt-6 font-display text-[30px] leading-tight text-feather">
              Learn something.
              <br />
              Get paid for it.
            </h1>
            <p className="mt-3 font-sans text-[15px] font-bold text-wolf">
              Complete daily tasks, build a streak, and turn your coins into real cash.
            </p>
            <div className="mt-8 flex gap-4 text-[32px]">
              <span data-ob-item>🔥</span>
              <span data-ob-item>⚡</span>
              <span data-ob-item>🪙</span>
              <span data-ob-item>🏆</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div data-step>
            <Mascot size={56} say="What do you want to learn?" />
            <div className="mt-6 flex flex-col gap-3">
              {COURSES.map((c) => (
                <button
                  key={c.id}
                  data-ob-item
                  onClick={() => {
                    haptic.tap()
                    setCourseId(c.id)
                  }}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left ${
                    courseId === c.id ? 'border-feather bg-[#D7FFB8]' : 'border-swan bg-white'
                  }`}
                  style={{ borderBottomWidth: 4 }}
                >
                  <span className="text-[32px]">{c.flag}</span>
                  <div className="flex-1">
                    <div className="font-display text-[16px] text-eel">{c.name}</div>
                    <div className="font-sans text-[12px] font-bold text-hare">{c.blurb}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div data-step>
            <Mascot size={56} say="Pick a daily goal — you can change it later." />
            <div className="mt-6 flex flex-col gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.xp}
                  data-ob-item
                  onClick={() => {
                    haptic.tap()
                    setGoal(g.xp)
                  }}
                  className={`flex items-center justify-between rounded-2xl border-2 px-4 py-4 ${
                    goal === g.xp ? 'border-feather bg-[#D7FFB8]' : 'border-swan bg-white'
                  }`}
                  style={{ borderBottomWidth: 4 }}
                >
                  <div className="text-left">
                    <div className="font-display text-[16px] text-eel">{g.label}</div>
                    <div className="font-sans text-[12px] font-bold text-hare">{g.time}</div>
                  </div>
                  <span className="font-display text-[16px] text-bee-dark">{g.xp} XP</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div data-step>
            <Mascot size={56} say="Tap what interests you — we'll personalize your feed." />
            <div className="mt-6 grid grid-cols-2 gap-3">
              {INTERESTS.map((i) => {
                const on = interests.includes(i.id)
                return (
                  <button
                    key={i.id}
                    data-ob-item
                    onClick={() => {
                      haptic.tap()
                      setInterests(on ? interests.filter((x) => x !== i.id) : [...interests, i.id])
                    }}
                    className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-5 ${
                      on ? 'border-beetle bg-[#F5E6FF]' : 'border-swan bg-white'
                    }`}
                    style={{ borderBottomWidth: 4 }}
                  >
                    <span className="text-[28px]">{i.icon}</span>
                    <span className="font-display text-[13px] text-eel">{i.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div data-step>
            <Mascot size={56} say="Last thing — who are you?" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-6 w-full rounded-2xl border-2 border-swan px-4 py-3.5 font-sans text-[16px] font-bold text-eel outline-none focus:border-macaw"
              style={{ borderBottomWidth: 4 }}
            />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  data-ob-item
                  onClick={() => {
                    haptic.tap()
                    setAvatar(a)
                  }}
                  className={`grid h-16 place-items-center rounded-2xl border-2 text-[30px] ${
                    avatar === a ? 'border-macaw bg-[#DDF4FF]' : 'border-swan bg-white'
                  }`}
                  style={{ borderBottomWidth: 4 }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t-2 border-swan bg-white px-5 pb-8 pt-4">
        <Button variant="green" size="lg" full disabled={!canNext} onClick={next}>
          {step === 4 ? "Let's go" : 'Continue'}
        </Button>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-3 w-full font-display text-[13px] uppercase tracking-wide text-hare"
          >
            Back
          </button>
        )}
      </div>
    </div>
  )
}
    