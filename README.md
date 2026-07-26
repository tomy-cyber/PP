# CoinQuest

A Duolingo-style learn-and-earn mobile app for iOS and Android. React + TypeScript + Tailwind, animated entirely with GSAP, packaged natively with Capacitor.

## Run it

```bash
cd coinquest
npm install
npm run dev          # opens at http://localhost:5173 — use device toolbar in devtools
```

## Ship it to phones

```bash
npm run build
npx cap add ios          # once — requires macOS + Xcode
npx cap add android      # once — requires Android Studio
npm run ios              # build + sync + open Xcode
npm run android          # build + sync + open Android Studio
```

`npm run sync` rebuilds the web bundle and copies it into both native projects. After that, run on a device or simulator from Xcode / Android Studio as usual.

## What's in the box

The five tabs are Learn, Quests, League, Wallet and You. Learn renders a winding lesson path with zig-zag 3D nodes, a sticky unit banner, a daily-goal bar, a limited-time double-coins event with a live countdown, and a personalized "See what's new today" recommendation card that picks either your next lesson or your weakest one. Tapping a node opens the lesson player.

The lesson player supports five exercise types: multiple choice, true/false, fill-the-blank with a word bank, tap-to-build sentences, and pair matching. Wrong answers cost a heart and shake the screen; right answers fire a small confetti burst. Hearts regenerate one every 30 minutes or can be refilled for 350 coins. Finishing a lesson rolls up XP, accuracy and coins on a summary screen, then a reward modal where the coins physically fly along a motion path into the wallet counter in the top bar.

Quests holds four daily tasks rerolled each midnight, each with an animated progress bar that wobbles when claimable, plus six tiered achievements. League shows your bracket with live rank reshuffles animated with GSAP Flip as rival XP ticks up, and a friends tab. Wallet converts coins to dollars (1,000 coins = $1.00), runs the full cash-out flow across PayPal, bank transfer and gift card, keeps payout history, and holds your referral code worth 1,000 coins per invite.

## Where to change things

Content lives in `src/data/content.ts` as plain data — three courses ship (Money Skills, Brain Trivia, and a Sandbox placeholder deck). Add a course by appending to `COURSES`; every exercise type renders straight from a JSON-shaped object, so no component changes are needed.

Economy rules — coins per dollar, minimum cash-out, heart count, refill interval, XP per level, quest pool, achievement tiers — are all constants at the top of `src/store/useStore.ts`.

Every animation routes through `src/lib/anim.ts`. It registers Flip, Draggable, MotionPath and CustomEase, defines the squishy custom eases, and exports the reusable choreography: `pop`, `shake`, `float`, `pulse`, `wobble`, `staggerIn`, `screenIn`, `sheetIn/Out`, `countTo`, `fillBar`, `confetti`, `flyTo`, `celebrate`, `orbit`, and `flipReorder`. Change a timing there and it changes everywhere. Components scope their tweens with the `useGsap` hook in `src/hooks/useGsap.ts`, which auto-reverts on unmount.

Colors are the exact Duolingo palette, defined in `tailwind.config.js` under their internal names (feather, macaw, bee, cardinal, beetle, fox, eel, wolf, hare, swan, polar). The 3D push-button and answer-card styles are in `src/index.css`.

## Before you launch with real money

Cash-out currently queues a request locally and deducts coins — no funds move. To go live you need a backend holding the coin ledger (never trust the client), a payouts provider such as PayPal Payouts, Stripe Connect or Tremendous, KYC and tax handling above reporting thresholds, and fraud controls on referrals and multi-accounting. Both stores also review reward apps closely: Apple requires that earned currency not be purchasable and that the mechanic isn't a game of chance, and Google has similar rules. Worth reading both policies before submission.

The mascot is an emoji placeholder — drop your animated character into `src/components/Mascot.tsx` when the artwork is ready.
