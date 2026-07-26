/**
 * Central GSAP animation library.
 * Every motion in the app routes through here so timings stay consistent.
 */
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { Draggable } from 'gsap/Draggable'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(Flip, Draggable, MotionPathPlugin, CustomEase)

/* ------------------------------------------------------------------ */
/* Custom eases — the "squishy" Duolingo feel                          */
/* ------------------------------------------------------------------ */
export const EASE = {
  pop: CustomEase.create('pop', 'M0,0 C0.2,0 0.1,1.4 0.5,1.08 0.75,0.93 0.85,1 1,1'),
  soft: CustomEase.create('soft', 'M0,0 C0.25,0.1 0.25,1 1,1'),
  snap: 'back.out(2.2)',
  bounce: 'elastic.out(1, 0.45)',
  smooth: 'power3.out',
  inOut: 'power2.inOut',
} as const

gsap.defaults({ ease: EASE.smooth, duration: 0.45 })

export { gsap, Flip, Draggable, MotionPathPlugin }

type El = Element | null | undefined
const ok = (el: El): el is Element => !!el

/* ------------------------------------------------------------------ */
/* Micro-interactions                                                  */
/* ------------------------------------------------------------------ */

/** Squash-and-stretch press feedback for any tappable element. */
export function pressIn(el: El) {
  if (!ok(el)) return
  gsap.to(el, { scale: 0.94, duration: 0.09, ease: 'power2.out', overwrite: 'auto' })
}
export function pressOut(el: El) {
  if (!ok(el)) return
  gsap.to(el, { scale: 1, duration: 0.42, ease: EASE.bounce, overwrite: 'auto' })
}

/** Attention pop — used on XP gains, coin drops, badge unlocks. */
export function pop(el: El, scale = 1.18) {
  if (!ok(el)) return
  return gsap
    .timeline()
    .fromTo(el, { scale: 0.5, opacity: 0 }, { scale, opacity: 1, duration: 0.32, ease: EASE.snap })
    .to(el, { scale: 1, duration: 0.28, ease: EASE.bounce })
}

/** Horizontal error shake (wrong answer). */
export function shake(el: El) {
  if (!ok(el)) return
  return gsap.fromTo(
    el,
    { x: -10 },
    { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.28)', clearProps: 'x' },
  )
}

/** Slow idle float — mascot, empty states. */
export function float(el: El, amount = 8, dur = 2.2) {
  if (!ok(el)) return
  return gsap.to(el, {
    y: `-=${amount}`,
    duration: dur,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  })
}

/** Heartbeat pulse — streak flame, live indicators. */
export function pulse(el: El, scale = 1.09, dur = 0.9) {
  if (!ok(el)) return
  return gsap.to(el, { scale, duration: dur, ease: 'sine.inOut', repeat: -1, yoyo: true })
}

/** Gentle wobble to draw the eye (FOMO badges, limited events). */
export function wobble(el: El) {
  if (!ok(el)) return
  return gsap.to(el, {
    rotate: 6,
    duration: 0.14,
    yoyo: true,
    repeat: 5,
    ease: 'sine.inOut',
    transformOrigin: '50% 100%',
    onComplete: () => gsap.set(el, { rotate: 0 }),
  })
}

/* ------------------------------------------------------------------ */
/* Entrances                                                           */
/* ------------------------------------------------------------------ */

/** Staggered rise for lists, cards, leaderboard rows. */
export function staggerIn(els: ArrayLike<Element> | string, opts: gsap.TweenVars = {}) {
  return gsap.fromTo(
    els,
    { y: 26, opacity: 0, scale: 0.97 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: EASE.smooth,
      stagger: 0.055,
      clearProps: 'transform',
      ...opts,
    },
  )
}

/** Screen transition — new screen slides/fades up over the old one. */
export function screenIn(el: El) {
  if (!ok(el)) return
  return gsap.fromTo(
    el,
    { opacity: 0, y: 18, scale: 0.985 },
    { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: EASE.smooth, clearProps: 'all' },
  )
}

/** Modal / sheet rising from the bottom. */
export function sheetIn(el: El, backdrop?: El) {
  const tl = gsap.timeline()
  if (ok(backdrop)) tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0)
  if (ok(el)) {
    tl.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: EASE.pop }, 0)
  }
  return tl
}

export function sheetOut(el: El, backdrop?: El, onDone?: () => void) {
  const tl = gsap.timeline({ onComplete: onDone })
  if (ok(el)) tl.to(el, { yPercent: 100, duration: 0.3, ease: 'power2.in' }, 0)
  if (ok(backdrop)) tl.to(backdrop, { opacity: 0, duration: 0.3 }, 0)
  return tl
}

/* ------------------------------------------------------------------ */
/* Numbers & bars                                                      */
/* ------------------------------------------------------------------ */

/** Roll a number up like a slot machine. */
export function countTo(
  el: El,
  from: number,
  to: number,
  opts: { duration?: number; prefix?: string; suffix?: string; decimals?: number } = {},
) {
  if (!ok(el)) return
  const { duration = 0.9, prefix = '', suffix = '', decimals = 0 } = opts
  const obj = { v: from }
  return gsap.to(obj, {
    v: to,
    duration,
    ease: 'power2.out',
    onUpdate() {
      el.textContent =
        prefix +
        (decimals
          ? obj.v.toFixed(decimals)
          : Math.round(obj.v).toLocaleString('en-US')) +
        suffix
    },
  })
}

/** Animate a 0..1 progress bar fill. */
export function fillBar(el: El, pct: number, dur = 0.55) {
  if (!ok(el)) return
  return gsap.to(el, { width: `${Math.max(0, Math.min(100, pct))}%`, duration: dur, ease: EASE.smooth })
}

/* ------------------------------------------------------------------ */
/* Reward choreography                                                 */
/* ------------------------------------------------------------------ */

const COLORS = ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF', '#FF9600']

/** Confetti burst from a point inside `host`. */
export function confetti(host: El, count = 40, origin?: { x: number; y: number }) {
  if (!ok(host)) return
  const rect = host.getBoundingClientRect()
  const ox = origin?.x ?? rect.width / 2
  const oy = origin?.y ?? rect.height / 2
  const pieces: HTMLElement[] = []

  for (let i = 0; i < count; i++) {
    const p = document.createElement('i')
    p.className = 'confetti-piece'
    p.style.background = COLORS[i % COLORS.length]
    p.style.left = `${ox}px`
    p.style.top = `${oy}px`
    if (i % 3 === 0) p.style.borderRadius = '50%'
    host.appendChild(p)
    pieces.push(p)
  }

  const tl = gsap.timeline({
    onComplete: () => pieces.forEach((p) => p.remove()),
  })

  pieces.forEach((p) => {
    const angle = gsap.utils.random(-Math.PI, 0)
    const power = gsap.utils.random(160, 420)
    tl.to(
      p,
      {
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power,
        rotation: gsap.utils.random(-720, 720),
        duration: gsap.utils.random(0.7, 1.15),
        ease: 'power2.out',
      },
      0,
    )
      .to(p, { y: `+=${gsap.utils.random(300, 640)}`, duration: 1.1, ease: 'power1.in' }, 0.55)
      .to(p, { opacity: 0, duration: 0.35 }, 1.2)
  })

  return tl
}

/**
 * Fly a reward token from a source element to a target element (e.g. coin
 * flying from the lesson-complete card up into the wallet counter).
 */
export function flyTo(
  from: El,
  to: El,
  opts: { emoji?: string; count?: number; onArrive?: () => void } = {},
) {
  if (!ok(from) || !ok(to)) {
    opts.onArrive?.()
    return
  }
  const { emoji = '🪙', count = 8, onArrive } = opts
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  const tl = gsap.timeline({ onComplete: onArrive })

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.textContent = emoji
    Object.assign(el.style, {
      position: 'fixed',
      left: `${a.left + a.width / 2}px`,
      top: `${a.top + a.height / 2}px`,
      fontSize: '26px',
      zIndex: '9999',
      pointerEvents: 'none',
      willChange: 'transform',
    } as CSSStyleDeclaration)
    document.body.appendChild(el)

    tl.to(
      el,
      {
        motionPath: {
          path: [
            { x: 0, y: 0 },
            {
              x: (b.left - a.left) * 0.4 + gsap.utils.random(-90, 90),
              y: gsap.utils.random(-160, -60),
            },
            { x: b.left - a.left + b.width / 2 - a.width / 2, y: b.top - a.top },
          ],
          curviness: 1.4,
        },
        scale: 0.55,
        duration: gsap.utils.random(0.65, 0.95),
        ease: 'power2.inOut',
        onComplete: () => el.remove(),
      },
      i * 0.055,
    )
  }
  // recipient reacts
  tl.to(to, { scale: 1.28, duration: 0.16, ease: 'power2.out' }, '>-0.15').to(to, {
    scale: 1,
    duration: 0.5,
    ease: EASE.bounce,
  })
  return tl
}

/** Big celebratory reveal for level-up / achievement modals. */
export function celebrate(card: El, ring?: El) {
  const tl = gsap.timeline()
  if (ok(card)) {
    tl.fromTo(
      card,
      { scale: 0.4, opacity: 0, rotate: -12 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.7, ease: EASE.snap },
    )
  }
  if (ok(ring)) {
    tl.fromTo(
      ring,
      { scale: 0.5, opacity: 0.9 },
      { scale: 2.4, opacity: 0, duration: 0.9, ease: 'power2.out' },
      0.1,
    )
  }
  return tl
}

/** Spinning conic glow behind badges. Accepts an element or a selector. */
export function orbit(el: El | string, dur = 8) {
  if (!el) return
  return gsap.to(el, { rotate: 360, duration: dur, ease: 'none', repeat: -1 })
}

/* ------------------------------------------------------------------ */
/* Layout transitions (Flip)                                           */
/* ------------------------------------------------------------------ */

/** Capture → mutate → animate. Used for leaderboard rank reshuffles. */
export function flipReorder(targets: string, mutate: () => void) {
  const state = Flip.getState(targets)
  mutate()
  return Flip.from(state, {
    duration: 0.65,
    ease: EASE.smooth,
    stagger: 0.03,
    absolute: true,
  })
}

export const random = gsap.utils.random