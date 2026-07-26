import { useEffect, useRef } from 'react'
import { celebrate, confetti, orbit, flyTo, gsap, countTo } from '../lib/anim'
import { haptic } from '../lib/haptics'
import { Button } from './Button'

interface Props {
  open: boolean
  title: string
  subtitle?: string
  icon: string
  coins?: number
  xp?: number
  cta?: string
  onClose: () => void
}

export function RewardModal({ open, title, subtitle, icon, coins = 0, xp = 0, cta = 'Claim', onClose }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const coinEl = useRef<HTMLSpanElement>(null)
  const xpEl = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    haptic.success()
    const ctx = gsap.context(() => {
      gsap.fromTo(host.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      celebrate(card.current, ring.current)
      orbit(glow.current, 9)
      confetti(host.current, 46, {
        x: (host.current?.clientWidth ?? 320) / 2,
        y: (host.current?.clientHeight ?? 600) * 0.4,
      })
      if (coins) countTo(coinEl.current, 0, coins, { duration: 1.1, prefix: '+' })
      if (xp) countTo(xpEl.current, 0, xp, { duration: 1.1, prefix: '+' })
      gsap.from('[data-reward-row]', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.35,
        ease: 'back.out(1.8)',
      })
    }, host)
    return () => ctx.revert()
  }, [open, coins, xp])

  if (!open) return null

  const claim = () => {
    const target = document.getElementById('coin-target')
    if (coins && target && card.current) {
      flyTo(card.current, target, { emoji: '🪙', count: 10, onArrive: onClose })
      gsap.to(card.current, { scale: 0.85, opacity: 0, duration: 0.35, delay: 0.15, ease: 'power2.in' })
    } else {
      gsap.to(card.current, { scale: 0.85, opacity: 0, duration: 0.28, onComplete: onClose })
    }
  }

  return (
    <div ref={host} className="fixed inset-0 z-[60] overflow-hidden bg-black/60 px-6 pb-10 pt-24">
      <div
        ref={card}
        className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white px-6 pb-6 pt-10 text-center"
      >
        <div
          ref={glow}
          className="pointer-events-none absolute left-1/2 top-16 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 opacity-30"
          style={{
            background:
              'conic-gradient(from 0deg, #FFC800, transparent 25%, #58CC02, transparent 50%, #1CB0F6, transparent 75%, #CE82FF)',
            borderRadius: '50%',
          }}
        />
        <div
          ref={ring}
          className="pointer-events-none absolute left-1/2 top-16 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-bee"
        />
        <div className="relative text-[64px] leading-none">{icon}</div>

        <h2 className="relative mt-4 font-display text-[26px] text-bee-dark">{title}</h2>
        {subtitle && <p className="relative mt-1 font-sans text-[15px] font-bold text-wolf">{subtitle}</p>}

        <div className="relative mt-6 flex justify-center gap-3">
          {!!xp && (
            <div data-reward-row className="card-soft flex-1 px-3 py-3">
              <div className="font-display text-[11px] uppercase tracking-wide text-bee-dark">Total XP</div>
              <div className="mt-1 flex items-center justify-center gap-1">
                <span className="text-[18px]">⚡</span>
                <span ref={xpEl} className="font-display text-[22px] text-bee-dark">+0</span>
              </div>
            </div>
          )}
          {!!coins && (
            <div data-reward-row className="card-soft flex-1 px-3 py-3">
              <div className="font-display text-[11px] uppercase tracking-wide text-fox">Coins</div>
              <div className="mt-1 flex items-center justify-center gap-1">
                <span className="text-[18px]">🪙</span>
                <span ref={coinEl} className="font-display text-[22px] text-fox">+0</span>
              </div>
            </div>
          )}
        </div>

        <Button variant="green" size="lg" full className="mt-6" onClick={claim}>
          {cta}
        </Button>
      </div>
    </div>
  )
}
