import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise, Lesson } from '../data/content'
import { useStore } from '../store/useStore'
import { Button, IconButton } from '../components/Button'
import { RewardModal } from '../components/RewardModal'
import { Mascot } from '../components/Mascot'
import { gsap, shake, pop, confetti, fillBar, staggerIn, EASE, countTo } from '../lib/anim'
import { useGsap } from '../hooks/useGsap'
import { haptic } from '../lib/haptics'

type Phase = 'answering' | 'right' | 'wrong' | 'summary'

interface Props {
  lesson: Lesson
  color: string
  onExit: () => void
  onDone: () => void
}

export function LessonPlayer({ lesson, onExit, onDone }: Props) {
  const { hearts, loseHeart, finishLesson } = useStore()
  const isChest = lesson.type === 'chest'

  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [correctCount, setCorrect] = useState(0)
  const [answer, setAnswer] = useState<unknown>(null)
  const [reward, setReward] = useState<{ xp: number; coins: number; leveledUp: boolean } | null>(null)
  const [showReward, setShowReward] = useState(false)
  const [chestOpen, setChestOpen] = useState(false)
  const startedAt = useRef(Date.now())

  const total = lesson.exercises.length
  const ex = lesson.exercises[idx]

  const host = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const banner = useRef<HTMLDivElement>(null)
  const chest = useRef<HTMLDivElement>(null)

  /* ---------------- progress bar ---------------- */
  useEffect(() => {
    fillBar(bar.current, total ? (idx / total) * 100 : 0)
  }, [idx, total])

  /* ---------------- question entrance ---------------- */
  const scope = useGsap(() => {
    gsap.fromTo(
      '[data-question]',
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
    )
    staggerIn('[data-answer-item]', { stagger: 0.06, duration: 0.4 })
  }, [idx, lesson.id])

  /* ---------------- feedback banner ---------------- */
  useEffect(() => {
    if (phase === 'right' || phase === 'wrong') {
      gsap.fromTo(
        banner.current,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.42, ease: EASE.pop },
      )
      if (phase === 'right') {
        haptic.success()
        confetti(host.current, 18, {
          x: (host.current?.clientWidth ?? 320) / 2,
          y: (host.current?.clientHeight ?? 600) * 0.5,
        })
      } else {
        haptic.error()
        shake(host.current)
      }
    }
  }, [phase])

  /* ---------------- chest ---------------- */
  useEffect(() => {
    if (!isChest || !chest.current) return
    const ctx = gsap.context(() => {
      gsap.to(chest.current, {
        rotate: 5,
        duration: 0.28,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        transformOrigin: '50% 100%',
      })
      gsap.fromTo(
        chest.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: EASE.snap },
      )
    })
    return () => ctx.revert()
  }, [isChest])

  const openChest = () => {
    if (chestOpen) return
    setChestOpen(true)
    haptic.heavy()
    gsap.killTweensOf(chest.current)
    gsap
      .timeline()
      .to(chest.current, { scale: 1.25, rotate: 0, duration: 0.25, ease: 'power2.out' })
      .to(chest.current, { scale: 1, duration: 0.4, ease: 'elastic.out(1,0.4)' })
      .add(() => {
        confetti(host.current, 60, {
          x: (host.current?.clientWidth ?? 320) / 2,
          y: (host.current?.clientHeight ?? 600) * 0.45,
        })
        const r = finishLesson(lesson.id, 1, 1, 'chest')
        setReward(r)
        setShowReward(true)
      }, '-=0.2')
  }

  /* ---------------- answer checking ---------------- */
  const isCorrect = useMemo(() => {
    if (!ex) return false
    switch (ex.kind) {
      case 'choice':
        return answer === ex.answer
      case 'truefalse':
        return answer === ex.answer
      case 'bank':
        return answer === ex.answer
      case 'tap':
        return (
          Array.isArray(answer) &&
          (answer as string[]).map((k) => k.split('#')[0]).join(' ') === ex.answer.join(' ')
        )
      case 'match':
        return answer === true
      default:
        return false
    }
  }, [answer, ex])

  const canCheck = answer !== null && answer !== undefined

  const check = () => {
    if (!canCheck) return
    if (isCorrect) {
      setCorrect((c) => c + 1)
      setPhase('right')
    } else {
      loseHeart()
      setPhase('wrong')
    }
  }

  const next = () => {
    setAnswer(null)
    if (idx + 1 >= total) {
      const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))
      useStore.getState().bumpQuest('minutes', minutes)
      const r = finishLesson(lesson.id, correctCount, total, lesson.type)
      setReward(r)
      setPhase('summary')
      fillBar(bar.current, 100)
    } else {
      setIdx((i) => i + 1)
      setPhase('answering')
    }
  }

  /* ================= CHEST SCREEN ================= */
  if (isChest) {
    return (
      <div ref={host} className="relative flex h-full flex-col overflow-hidden bg-white">
        <div className="safe-top flex items-center px-4 pb-2">
          <IconButton label="Close" onClick={onExit} className="text-hare">
            <span className="text-[22px]">✕</span>
          </IconButton>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div ref={chest} className="text-[110px] leading-none" onClick={openChest}>
            {chestOpen ? '🎉' : '🎁'}
          </div>
          <h2 className="mt-6 font-display text-[24px] text-fox">Daily bonus chest</h2>
          <p className="mt-2 font-sans text-[15px] font-bold text-wolf">
            Tap the chest to collect your coins.
          </p>
          <Button variant="gold" size="lg" full className="mt-8" onClick={openChest} disabled={chestOpen}>
            Open chest
          </Button>
        </div>

        <RewardModal
          open={showReward}
          icon="🪙"
          title="Chest opened!"
          subtitle="Come back tomorrow for another one"
          coins={reward?.coins ?? 0}
          xp={reward?.xp ?? 0}
          onClose={onDone}
        />
      </div>
    )
  }

  /* ================= SUMMARY ================= */
  if (phase === 'summary') {
    return (
      <Summary
        correct={correctCount}
        total={total}
        reward={reward}
        onContinue={() => setShowReward(true)}
        showReward={showReward}
        onDone={onDone}
      />
    )
  }

  /* ================= EXERCISE ================= */
  return (
    <div ref={host} className="relative flex h-full flex-col overflow-hidden bg-white">
      {/* header */}
      <div className="safe-top flex items-center gap-3 px-4 pb-3">
        <IconButton label="Quit" onClick={onExit} className="text-hare">
          <span className="text-[22px]">✕</span>
        </IconButton>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-swan">
          <div ref={bar} className="relative h-full rounded-full bg-feather" style={{ width: '0%' }}>
            <div className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/35" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[20px] ${hearts === 0 ? 'grayscale' : ''}`}>❤️</span>
          <span className="font-display text-[18px] text-cardinal">{hearts}</span>
        </div>
      </div>

      {/* body */}
      <div ref={scope} className="flex-1 overflow-y-auto no-scrollbar px-5 pb-40">
        <h2 data-question className="mt-2 font-display text-[22px] leading-snug text-eel">
          {ex.prompt}
        </h2>
        <div className="mt-6">
          <ExerciseView ex={ex} phase={phase} answer={answer} setAnswer={setAnswer} />
        </div>
      </div>

      {/* footer / feedback */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        {(phase === 'right' || phase === 'wrong') && (
          <div
            ref={banner}
            className={`pointer-events-auto px-5 pb-8 pt-4 ${
              phase === 'right' ? 'bg-[#D7FFB8]' : 'bg-[#FFDFE0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[34px]">{phase === 'right' ? '🎉' : '😕'}</span>
              <div className="flex-1">
                <div
                  className={`font-display text-[19px] ${
                    phase === 'right' ? 'text-feather-dark' : 'text-cardinal-dark'
                  }`}
                >
                  {phase === 'right' ? 'Nice!' : 'Not quite'}
                </div>
                {phase === 'wrong' && (
                  <div className="font-sans text-[13px] font-bold text-cardinal-dark/80">
                    {'hint' in ex && ex.hint ? ex.hint : correctText(ex)}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant={phase === 'right' ? 'green' : 'red'}
              size="lg"
              full
              className="mt-4"
              onClick={next}
            >
              Continue
            </Button>
          </div>
        )}

        {phase === 'answering' && (
          <div className="pointer-events-auto border-t-2 border-swan bg-white px-5 pb-8 pt-4">
            <Button variant="green" size="lg" full disabled={!canCheck} onClick={check}>
              Check
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function correctText(ex: Exercise): string {
  switch (ex.kind) {
    case 'choice':
      return `Answer: ${ex.options[ex.answer]}`
    case 'truefalse':
      return `Answer: ${ex.answer ? 'True' : 'False'}`
    case 'bank':
      return `Answer: ${ex.answer}`
    case 'tap':
      return `Answer: ${ex.answer.join(' ')}`
    default:
      return 'Give it another go.'
  }
}

/* ================================================================== */
/* Exercise renderers                                                  */
/* ================================================================== */

function ExerciseView({
  ex,
  phase,
  answer,
  setAnswer,
}: {
  ex: Exercise
  phase: Phase
  answer: unknown
  setAnswer: (v: unknown) => void
}) {
  const locked = phase !== 'answering'

  if (ex.kind === 'choice') {
    return (
      <div className="flex flex-col gap-3">
        {ex.options.map((o, i) => (
          <OptionCard
            key={i}
            label={o}
            selected={answer === i}
            state={locked ? (i === ex.answer ? 'correct' : answer === i ? 'wrong' : 'idle') : 'idle'}
            onPress={() => !locked && setAnswer(i)}
          />
        ))}
      </div>
    )
  }

  if (ex.kind === 'truefalse') {
    return (
      <div>
        <div className="card-soft mb-6 px-4 py-5 text-center font-sans text-[17px] font-extrabold text-eel">
          {ex.statement}
        </div>
        <div className="flex gap-3">
          {[true, false].map((v) => (
            <OptionCard
              key={String(v)}
              className="flex-1 text-center"
              label={v ? '✅  True' : '❌  False'}
              selected={answer === v}
              state={locked ? (v === ex.answer ? 'correct' : answer === v ? 'wrong' : 'idle') : 'idle'}
              onPress={() => !locked && setAnswer(v)}
            />
          ))}
        </div>
      </div>
    )
  }

  if (ex.kind === 'bank') {
    const [a, b] = ex.sentence.split('___')
    return (
      <div>
        <div className="card-soft mb-6 px-4 py-5 text-center font-sans text-[17px] font-extrabold leading-relaxed text-eel">
          {a}
          <span
            className={`mx-1 inline-block min-w-[86px] rounded-lg border-b-4 px-2 ${
              answer ? 'border-macaw text-macaw-dark' : 'border-swan text-hare'
            }`}
          >
            {(answer as string) || ' '}
          </span>
          {b}
        </div>
        <div className="flex flex-wrap gap-3">
          {ex.bank.map((w) => (
            <OptionCard
              key={w}
              className="!w-auto"
              label={w}
              selected={answer === w}
              state={locked ? (w === ex.answer ? 'correct' : answer === w ? 'wrong' : 'idle') : 'idle'}
              onPress={() => !locked && setAnswer(w)}
            />
          ))}
        </div>
      </div>
    )
  }

  if (ex.kind === 'tap') {
    return <TapBuilder ex={ex} locked={locked} answer={answer as string[] | null} setAnswer={setAnswer} />
  }

  return <MatchGrid ex={ex} locked={locked} setAnswer={setAnswer} />
}

function OptionCard({
  label,
  selected,
  state,
  onPress,
  className = '',
}: {
  label: string
  selected: boolean
  state: 'idle' | 'correct' | 'wrong'
  onPress: () => void
  className?: string
}) {
  const el = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (state === 'correct') pop(el.current, 1.06)
    if (state === 'wrong') shake(el.current)
  }, [state])

  const cls =
    state === 'correct' ? 'correct' : state === 'wrong' ? 'wrong' : selected ? 'selected' : ''

  return (
    <button
      ref={el}
      data-answer-item
      className={`opt-card ${cls} ${className}`}
      onPointerDown={() => gsap.to(el.current, { scale: 0.97, duration: 0.08 })}
      onPointerUp={() => gsap.to(el.current, { scale: 1, duration: 0.35, ease: 'elastic.out(1,0.5)' })}
      onPointerLeave={() => gsap.to(el.current, { scale: 1, duration: 0.2 })}
      onClick={() => {
        haptic.tap()
        onPress()
      }}
    >
      {label}
    </button>
  )
}

function TapBuilder({
  ex,
  locked,
  answer,
  setAnswer,
}: {
  ex: Extract<Exercise, { kind: 'tap' }>
  locked: boolean
  answer: string[] | null
  setAnswer: (v: unknown) => void
}) {
  const pool = useMemo(
    () => [...ex.answer, ...ex.distractors].sort(() => Math.random() - 0.5),
    [ex.id],
  )
  const chosen = answer ?? []

  const toggle = (key: string) => {
    if (locked) return
    haptic.tap()
    setAnswer(chosen.includes(key) ? chosen.filter((c) => c !== key) : [...chosen, key])
  }

  return (
    <div>
      <div className="mb-6 min-h-[64px] rounded-2xl border-2 border-dashed border-swan px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {chosen.map((k) => (
            <button
              key={k}
              data-answer-item
              onClick={() => toggle(k)}
              className="rounded-xl border-2 border-swan bg-white px-3 py-2 font-sans text-[15px] font-bold text-eel"
              style={{ borderBottomWidth: 4 }}
            >
              {k.split('#')[0]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((w, i) => {
          const key = `${w}#${i}`
          const used = chosen.includes(key)
          return (
            <button
              key={key}
              data-answer-item
              disabled={used}
              onClick={() => toggle(key)}
              className={`rounded-xl border-2 px-3 py-2 font-sans text-[15px] font-bold ${
                used ? 'border-swan bg-polar text-transparent' : 'border-swan bg-white text-eel'
              }`}
              style={{ borderBottomWidth: 4 }}
            >
              {w}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MatchGrid({
  ex,
  locked,
  setAnswer,
}: {
  ex: Extract<Exercise, { kind: 'match' }>
  locked: boolean
  setAnswer: (v: unknown) => void
}) {
  const lefts = useMemo(() => ex.pairs.map((p) => p.left), [ex.id])
  const rights = useMemo(() => [...ex.pairs.map((p) => p.right)].sort(() => Math.random() - 0.5), [ex.id])

  const [sel, setSel] = useState<{ side: 'l' | 'r'; value: string } | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [bad, setBad] = useState<string | null>(null)

  useEffect(() => {
    if (matched.length === ex.pairs.length * 2) setAnswer(true)
  }, [matched, ex.pairs.length])

  const tap = (side: 'l' | 'r', value: string) => {
    if (locked || matched.includes(value)) return
    haptic.tap()
    if (!sel) return setSel({ side, value })
    if (sel.side === side) return setSel({ side, value })

    const l = side === 'l' ? value : sel.value
    const r = side === 'r' ? value : sel.value
    const good = ex.pairs.some((p) => p.left === l && p.right === r)

    if (good) {
      haptic.success()
      setMatched((m) => [...m, l, r])
      setSel(null)
    } else {
      haptic.error()
      setBad(value)
      setTimeout(() => {
        setBad(null)
        setSel(null)
      }, 420)
    }
  }

  const cell = (side: 'l' | 'r', value: string) => {
    const isMatched = matched.includes(value)
    const isSel = sel?.value === value
    const isBad = bad === value || (bad && sel?.value === value)
    return (
      <MatchCell
        key={side + value}
        label={value}
        matched={isMatched}
        selected={!!isSel}
        bad={!!isBad}
        onPress={() => tap(side, value)}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-3">{lefts.map((l) => cell('l', l))}</div>
      <div className="flex flex-col gap-3">{rights.map((r) => cell('r', r))}</div>
    </div>
  )
}

function MatchCell({
  label,
  matched,
  selected,
  bad,
  onPress,
}: {
  label: string
  matched: boolean
  selected: boolean
  bad: boolean
  onPress: () => void
}) {
  const el = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (matched) {
      gsap
        .timeline()
        .to(el.current, { scale: 1.08, duration: 0.16 })
        .to(el.current, { scale: 1, opacity: 0.35, duration: 0.4, ease: 'power2.out' })
    }
  }, [matched])

  useEffect(() => {
    if (bad) shake(el.current)
  }, [bad])

  return (
    <button
      ref={el}
      data-answer-item
      disabled={matched}
      onClick={onPress}
      className={`opt-card text-center text-[14px] ${
        matched ? 'correct' : selected ? 'selected' : ''
      }`}
    >
      {label}
    </button>
  )
}

/* ================================================================== */
/* Summary                                                             */
/* ================================================================== */

function Summary({
  correct,
  total,
  reward,
  onContinue,
  showReward,
  onDone,
}: {
  correct: number
  total: number
  reward: { xp: number; coins: number; leveledUp: boolean } | null
  onContinue: () => void
  showReward: boolean
  onDone: () => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const accEl = useRef<HTMLSpanElement>(null)
  const accuracy = total ? Math.round((correct / total) * 100) : 100

  useGsap(() => {
    confetti(host.current, 50, {
      x: (host.current?.clientWidth ?? 320) / 2,
      y: (host.current?.clientHeight ?? 600) * 0.3,
    })
    gsap.from('[data-summary-stat]', {
      y: 30,
      opacity: 0,
      scale: 0.9,
      stagger: 0.12,
      duration: 0.6,
      ease: EASE.snap,
      delay: 0.2,
    })
    countTo(accEl.current, 0, accuracy, { duration: 1, suffix: '%' })
  }, [])

  return (
    <div ref={host} className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-white px-6">
      <Mascot mood="cheer" size={100} />
      <h1 className="mt-6 font-display text-[30px] text-feather">Lesson complete!</h1>

      <div className="mt-8 flex w-full max-w-sm gap-3">
        <div data-summary-stat className="flex-1 rounded-2xl bg-bee p-[2px]">
          <div className="rounded-[14px] bg-white px-3 py-3 text-center">
            <div className="font-display text-[11px] uppercase text-bee-dark">Total XP</div>
            <div className="font-display text-[22px] text-bee-dark">⚡ {reward?.xp ?? 0}</div>
          </div>
        </div>
        <div data-summary-stat className="flex-1 rounded-2xl bg-macaw p-[2px]">
          <div className="rounded-[14px] bg-white px-3 py-3 text-center">
            <div className="font-display text-[11px] uppercase text-macaw-dark">Accuracy</div>
            <div className="font-display text-[22px] text-macaw-dark">
              <span ref={accEl}>0%</span>
            </div>
          </div>
        </div>
        <div data-summary-stat className="flex-1 rounded-2xl bg-fox p-[2px]">
          <div className="rounded-[14px] bg-white px-3 py-3 text-center">
            <div className="font-display text-[11px] uppercase text-fox">Coins</div>
            <div className="font-display text-[22px] text-fox">🪙 {reward?.coins ?? 0}</div>
          </div>
        </div>
      </div>

      <Button variant="green" size="lg" full className="mt-10 max-w-sm" onClick={onContinue}>
        Collect reward
      </Button>

      <RewardModal
        open={showReward}
        icon={reward?.leveledUp ? '🎖️' : '🪙'}
        title={reward?.leveledUp ? 'Level up!' : 'Reward earned'}
        subtitle={reward?.leveledUp ? 'You reached a new level' : 'Coins added to your wallet'}
        coins={reward?.coins ?? 0}
        xp={reward?.xp ?? 0}
        onClose={onDone}
      />
    </div>
  )
}
