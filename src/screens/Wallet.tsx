import { useRef, useState } from 'react'
import {
  useStore,
  usdFromCoins,
  COINS_PER_USD,
  MIN_CASHOUT_USD,
  type PayoutRequest,
} from '../store/useStore'
import { Button } from '../components/Button'
import { Counter } from '../components/Counter'
import { Sheet } from '../components/Sheet'
import { RewardModal } from '../components/RewardModal'
import { gsap, staggerIn, screenIn, orbit, confetti, pop, EASE } from '../lib/anim'
import { useGsap } from '../hooks/useGsap'
import { haptic } from '../lib/haptics'

const METHODS: { id: PayoutRequest['method']; label: string; icon: string; note: string }[] = [
  { id: 'paypal', label: 'PayPal', icon: '🅿️', note: '1–2 business days' },
  { id: 'bank', label: 'Bank transfer', icon: '🏦', note: '3–5 business days' },
  { id: 'giftcard', label: 'Gift card', icon: '🎟️', note: 'Instant delivery' },
]

const AMOUNTS = [5, 10, 25, 50]

export function Wallet() {
  const { coins, lifetimeCoins, payouts, requestPayout, referralCode, referrals, addReferral } = useStore()
  const [sheet, setSheet] = useState(false)
  const [refSheet, setRefSheet] = useState(false)
  const [usd, setUsd] = useState(MIN_CASHOUT_USD)
  const [method, setMethod] = useState<PayoutRequest['method']>('paypal')
  const [dest, setDest] = useState('')
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)

  const glow = useRef<HTMLDivElement>(null)
  const host = useRef<HTMLDivElement>(null)

  const balanceUsd = usdFromCoins(coins)
  const canCashout = coins >= usd * COINS_PER_USD && usd >= MIN_CASHOUT_USD && dest.trim().length > 3

  const scope = useGsap(() => {
    screenIn(scope.current)
    orbit(glow.current, 14)
    staggerIn('[data-wallet-item]')
    gsap.from('[data-balance]', { scale: 0.7, opacity: 0, duration: 0.7, ease: EASE.snap })
  }, [])

  const submit = () => {
    const req = requestPayout(usd, method, dest.trim())
    if (!req) {
      haptic.error()
      return
    }
    haptic.success()
    setSheet(false)
    setTimeout(() => {
      setDone(true)
      confetti(host.current, 40)
    }, 350)
  }

  const copyCode = async () => {
    haptic.tap()
    try {
      await navigator.clipboard.writeText(`Join me on CoinQuest! Code: ${referralCode}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <div ref={host} className="relative flex-1 overflow-hidden">
      <div ref={scope} className="h-full overflow-y-auto no-scrollbar px-4 pb-10 pt-4">
        {/* balance card */}
        <div className="relative overflow-hidden rounded-3xl px-5 py-7 text-center" style={{ background: '#1CB0F6' }}>
          <div
            ref={glow}
            className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 opacity-25"
            style={{
              background: 'conic-gradient(from 0deg,#fff,transparent 30%,#FFC800,transparent 60%,#fff)',
              borderRadius: '50%',
            }}
          />
          <div className="relative font-display text-[12px] uppercase tracking-widest text-white/75">
            Cash balance
          </div>
          <div data-balance className="relative mt-1 font-display text-[46px] leading-none text-white">
            <Counter value={balanceUsd} prefix="$" decimals={2} celebrate />
          </div>
          <div className="relative mt-2 inline-flex items-center gap-1 rounded-pill bg-white/20 px-3 py-1 font-display text-[13px] text-white">
            🪙 <Counter value={coins} /> coins
          </div>
          <div className="relative mt-1 font-sans text-[11px] font-bold text-white/70">
            {COINS_PER_USD.toLocaleString()} coins = $1.00
          </div>

          <Button
            variant="gold"
            size="lg"
            full
            className="relative mt-6"
            disabled={balanceUsd < MIN_CASHOUT_USD}
            onClick={() => {
              setUsd(Math.max(MIN_CASHOUT_USD, Math.min(50, Math.floor(balanceUsd))))
              setSheet(true)
            }}
          >
            {balanceUsd < MIN_CASHOUT_USD ? `Min $${MIN_CASHOUT_USD} to cash out` : 'Cash out'}
          </Button>
        </div>

        {/* earn more */}
        <h2 className="mt-7 font-display text-[19px] text-eel">Ways to earn</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { icon: '📘', title: 'Finish a lesson', amt: '+90–290' },
            { icon: '🎁', title: 'Open daily chest', amt: '+250' },
            { icon: '🎯', title: 'Complete quests', amt: '+100–380' },
            { icon: '🤝', title: 'Invite a friend', amt: '+1,000' },
          ].map((c) => (
            <div key={c.title} data-wallet-item className="card-soft px-3 py-4 text-center">
              <div className="text-[26px]">{c.icon}</div>
              <div className="mt-1 font-display text-[13px] text-eel">{c.title}</div>
              <div className="mt-0.5 font-display text-[13px] text-fox">🪙 {c.amt}</div>
            </div>
          ))}
        </div>

        {/* referral */}
        <div
          data-wallet-item
          className="mt-6 overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(120deg,#CE82FF,#1CB0F6)' }}
        >
          <div className="px-5 py-5 text-white">
            <div className="font-display text-[18px]">Invite friends, earn 🪙 1,000</div>
            <div className="mt-1 font-sans text-[12px] font-bold opacity-90">
              They get 500 coins too. {referrals} joined so far.
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 rounded-xl bg-white/20 px-3 py-2.5 text-center font-display tracking-[0.2em]">
                {referralCode}
              </div>
              <Button size="sm" variant="ghost" onClick={copyCode}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <button
              className="mt-3 w-full rounded-xl bg-white/15 py-2 font-display text-[12px] uppercase tracking-wide"
              onClick={() => {
                haptic.tap()
                setRefSheet(true)
              }}
            >
              How it works
            </button>
          </div>
        </div>

        {/* payout history */}
        <h2 className="mt-7 font-display text-[19px] text-eel">Payout history</h2>
        {payouts.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-polar px-4 py-6 text-center font-sans text-[13px] font-bold text-hare">
            No payouts yet. Earn {MIN_CASHOUT_USD * COINS_PER_USD} coins to make your first one.
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {payouts.map((p) => (
              <div key={p.id} data-wallet-item className="card-soft flex items-center gap-3 px-4 py-3">
                <span className="text-[24px]">{METHODS.find((m) => m.id === p.method)?.icon}</span>
                <div className="flex-1">
                  <div className="font-display text-[15px] text-eel">${p.usd.toFixed(2)}</div>
                  <div className="font-sans text-[11px] font-bold text-hare">
                    {p.destination} · {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="chip bg-bee/25 text-bee-dark capitalize">{p.status}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-polar px-4 py-3 font-sans text-[11px] font-bold leading-relaxed text-hare">
          Payouts are processed by our payments partner. Identity verification may be required before
          your first withdrawal. Lifetime earned: 🪙 {lifetimeCoins.toLocaleString()}.
        </div>
      </div>

      {/* ---------- cash-out sheet ---------- */}
      <Sheet open={sheet} onClose={() => setSheet(false)}>
        <h2 className="font-display text-[22px] text-eel">Cash out</h2>
        <p className="mt-1 font-sans text-[13px] font-bold text-wolf">
          Available: ${balanceUsd.toFixed(2)}
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {AMOUNTS.map((a) => {
            const ok = coins >= a * COINS_PER_USD
            return (
              <button
                key={a}
                disabled={!ok}
                onClick={() => {
                  haptic.tap()
                  setUsd(a)
                }}
                className={`rounded-2xl border-2 py-3 font-display text-[16px] ${
                  usd === a
                    ? 'border-macaw bg-[#DDF4FF] text-macaw-dark'
                    : ok
                      ? 'border-swan bg-white text-eel'
                      : 'border-swan bg-polar text-hare opacity-50'
                }`}
                style={{ borderBottomWidth: 4 }}
              >
                ${a}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                haptic.tap()
                setMethod(m.id)
              }}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${
                method === m.id ? 'border-macaw bg-[#DDF4FF]' : 'border-swan bg-white'
              }`}
              style={{ borderBottomWidth: 4 }}
            >
              <span className="text-[24px]">{m.icon}</span>
              <div className="flex-1">
                <div className="font-display text-[15px] text-eel">{m.label}</div>
                <div className="font-sans text-[11px] font-bold text-hare">{m.note}</div>
              </div>
              {method === m.id && <span className="text-[18px]">✅</span>}
            </button>
          ))}
        </div>

        <input
          value={dest}
          onChange={(e) => setDest(e.target.value)}
          placeholder={
            method === 'paypal' ? 'PayPal email' : method === 'bank' ? 'IBAN / account number' : 'Email for gift card'
          }
          className="mt-4 w-full rounded-2xl border-2 border-swan px-4 py-3 font-sans text-[15px] font-bold text-eel outline-none focus:border-macaw"
          style={{ borderBottomWidth: 4 }}
        />

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-polar px-4 py-3">
          <span className="font-sans text-[13px] font-bold text-wolf">Coins deducted</span>
          <span className="font-display text-[16px] text-fox">
            🪙 {(usd * COINS_PER_USD).toLocaleString()}
          </span>
        </div>

        <Button variant="green" size="lg" full className="mt-5" disabled={!canCashout} onClick={submit}>
          Withdraw ${usd.toFixed(2)}
        </Button>
        <p className="mt-3 text-center font-sans text-[11px] font-bold text-hare">
          Demo build — this queues a request instead of moving real funds.
        </p>
      </Sheet>

      {/* ---------- referral explainer ---------- */}
      <Sheet open={refSheet} onClose={() => setRefSheet(false)}>
        <h2 className="font-display text-[22px] text-eel">Referral rewards</h2>
        <div className="mt-4 flex flex-col gap-3">
          {[
            { n: '1', t: 'Share your code', d: 'Send it to a friend however you like.' },
            { n: '2', t: 'They sign up', d: 'Your code is applied at signup. They get 🪙 500.' },
            { n: '3', t: 'They finish a lesson', d: 'You get 🪙 1,000 credited instantly.' },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-beetle font-display text-white">
                {s.n}
              </span>
              <div>
                <div className="font-display text-[15px] text-eel">{s.t}</div>
                <div className="font-sans text-[12px] font-bold text-wolf">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="purple"
          full
          size="lg"
          className="mt-6"
          onClick={(e) => {
            addReferral()
            pop(e.currentTarget)
            setRefSheet(false)
          }}
        >
          Simulate a referral (+🪙 1,000)
        </Button>
      </Sheet>

      <RewardModal
        open={done}
        icon="💸"
        title="Withdrawal requested"
        subtitle={`$${usd.toFixed(2)} via ${METHODS.find((m) => m.id === method)?.label}`}
        cta="Done"
        onClose={() => setDone(false)}
      />
    </div>
  )
}
