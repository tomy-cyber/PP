import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COURSES, allLessons } from '../data/content'

/* ------------------------------------------------------------------ */
/* Economy constants                                                   */
/* ------------------------------------------------------------------ */
export const COINS_PER_USD = 1000 // 1,000 coins = $1.00
export const MIN_CASHOUT_USD = 5
export const MAX_HEARTS = 5
export const HEART_REFILL_MS = 30 * 60 * 1000 // 30 min per heart
export const XP_PER_LEVEL = 500

export const LEAGUES = [
  { id: 'bronze', name: 'Bronze', icon: '🥉', color: '#CD7F32' },
  { id: 'silver', name: 'Silver', icon: '🥈', color: '#B0B7C3' },
  { id: 'gold', name: 'Gold', icon: '🥇', color: '#FFC800' },
  { id: 'sapphire', name: 'Sapphire', icon: '💎', color: '#1CB0F6' },
  { id: 'ruby', name: 'Ruby', icon: '❤️‍🔥', color: '#FF4B4B' },
  { id: 'diamond', name: 'Diamond', icon: '👑', color: '#CE82FF' },
] as const

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface QuestDef {
  id: string
  title: string
  icon: string
  goal: number
  reward: number // coins
  xpReward: number
  metric: 'xp' | 'lessons' | 'perfect' | 'minutes' | 'streak'
}

export interface Quest extends QuestDef {
  progress: number
  claimed: boolean
}

export interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  tiers: number[]
  metric: 'xp' | 'streak' | 'lessons' | 'perfect' | 'friends' | 'coins'
}

export interface Friend {
  id: string
  name: string
  avatar: string
  xpWeek: number
  streak: number
  isYou?: boolean
}

export interface LessonResult {
  stars: number
  bestAccuracy: number
  completedAt: number
}

export interface PayoutRequest {
  id: string
  usd: number
  method: 'paypal' | 'bank' | 'giftcard'
  destination: string
  status: 'pending' | 'processing' | 'paid'
  createdAt: number
}

interface State {
  /* profile */
  onboarded: boolean
  name: string
  avatar: string
  courseId: string
  joinedAt: number
  dailyGoal: number // xp/day
  interests: string[]

  /* economy */
  xp: number
  weekXp: number
  coins: number
  lifetimeCoins: number
  hearts: number
  heartsUpdatedAt: number
  streak: number
  streakFreezes: number
  lastActiveDay: string | null
  bestStreak: number

  /* progress */
  progress: Record<string, LessonResult>
  totalLessons: number
  perfectLessons: number

  /* engagement */
  quests: Quest[]
  questDay: string | null
  achievements: Record<string, number> // achievementId -> unlocked tier count
  leagueIndex: number
  friends: Friend[]
  referralCode: string
  referrals: number
  eventEndsAt: number

  /* cash-out */
  payouts: PayoutRequest[]

  /* transient */
  lastReward: { coins: number; xp: number } | null

  /* actions */
  init: () => void
  setOnboarded: (v: Partial<Pick<State, 'name' | 'avatar' | 'courseId' | 'dailyGoal' | 'interests'>>) => void
  setCourse: (id: string) => void
  finishLesson: (lessonId: string, correct: number, total: number, kind: 'lesson' | 'chest' | 'boss') => { xp: number; coins: number; leveledUp: boolean }
  loseHeart: () => void
  refillHearts: (all?: boolean) => void
  buyWithCoins: (cost: number) => boolean
  claimQuest: (id: string) => number
  bumpQuest: (metric: Quest['metric'], amount: number) => void
  requestPayout: (usd: number, method: PayoutRequest['method'], destination: string) => PayoutRequest | null
  addReferral: () => void
  clearReward: () => void
  reset: () => void
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
export const todayKey = () => new Date().toISOString().slice(0, 10)

const yesterdayKey = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export const levelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1
export const levelProgress = (xp: number) => (xp % XP_PER_LEVEL) / XP_PER_LEVEL
export const usdFromCoins = (c: number) => c / COINS_PER_USD

const QUEST_POOL: QuestDef[] = [
  { id: 'q-xp30', title: 'Earn 30 XP', icon: '⚡', goal: 30, reward: 120, xpReward: 10, metric: 'xp' },
  { id: 'q-xp60', title: 'Earn 60 XP', icon: '🔥', goal: 60, reward: 250, xpReward: 20, metric: 'xp' },
  { id: 'q-l2', title: 'Complete 2 lessons', icon: '📘', goal: 2, reward: 150, xpReward: 15, metric: 'lessons' },
  { id: 'q-l4', title: 'Complete 4 lessons', icon: '📚', goal: 4, reward: 320, xpReward: 30, metric: 'lessons' },
  { id: 'q-perfect', title: 'Score 1 perfect lesson', icon: '🎯', goal: 1, reward: 200, xpReward: 20, metric: 'perfect' },
  { id: 'q-perfect2', title: 'Score 2 perfect lessons', icon: '💯', goal: 2, reward: 380, xpReward: 35, metric: 'perfect' },
  { id: 'q-min10', title: 'Spend 10 minutes learning', icon: '⏱️', goal: 10, reward: 180, xpReward: 15, metric: 'minutes' },
  { id: 'q-streak', title: 'Extend your streak', icon: '🔥', goal: 1, reward: 100, xpReward: 10, metric: 'streak' },
]

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'wildfire', title: 'Wildfire', desc: 'Reach a {n} day streak', icon: '🔥', tiers: [3, 7, 14, 30, 100], metric: 'streak' },
  { id: 'scholar', title: 'Scholar', desc: 'Earn {n} total XP', icon: '🎓', tiers: [100, 500, 1500, 5000, 15000], metric: 'xp' },
  { id: 'sharpshooter', title: 'Sharpshooter', desc: 'Finish {n} perfect lessons', icon: '🎯', tiers: [1, 5, 15, 40, 100], metric: 'perfect' },
  { id: 'grinder', title: 'Grinder', desc: 'Complete {n} lessons', icon: '💪', tiers: [1, 10, 25, 60, 150], metric: 'lessons' },
  { id: 'tycoon', title: 'Tycoon', desc: 'Earn {n} lifetime coins', icon: '🪙', tiers: [500, 2500, 10000, 50000, 200000], metric: 'coins' },
  { id: 'friendly', title: 'Friendly', desc: 'Invite {n} friends', icon: '🤝', tiers: [1, 3, 10, 25, 50], metric: 'friends' },
]

const NAMES = ['Mira', 'Kofi', 'Lena', 'Diego', 'Aiko', 'Noah', 'Sara', 'Omar', 'Zoe', 'Ivan', 'Priya', 'Luca']
const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🦉', '🐙', '🦄', '🐧', '🐨', '🦈', '🐝', '🦖']

function seedFriends(): Friend[] {
  return NAMES.slice(0, 11).map((name, i) => ({
    id: `f${i}`,
    name,
    avatar: AVATARS[i % AVATARS.length],
    xpWeek: Math.round(40 + Math.random() * 620),
    streak: Math.round(Math.random() * 40),
  }))
}

function rollQuests(): Quest[] {
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5)
  const picked: QuestDef[] = []
  const seenMetrics = new Set<string>()
  for (const q of shuffled) {
    if (seenMetrics.has(q.metric)) continue
    seenMetrics.add(q.metric)
    picked.push(q)
    if (picked.length === 4) break
  }
  return picked.map((q) => ({ ...q, progress: 0, claimed: false }))
}

function makeReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function endOfDay() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */
const initial = {
  onboarded: false,
  name: 'You',
  avatar: '🦊',
  courseId: COURSES[0].id,
  joinedAt: Date.now(),
  dailyGoal: 50,
  interests: [] as string[],

  xp: 0,
  weekXp: 0,
  coins: 0,
  lifetimeCoins: 0,
  hearts: MAX_HEARTS,
  heartsUpdatedAt: Date.now(),
  streak: 0,
  streakFreezes: 1,
  lastActiveDay: null as string | null,
  bestStreak: 0,

  progress: {} as Record<string, LessonResult>,
  totalLessons: 0,
  perfectLessons: 0,

  quests: [] as Quest[],
  questDay: null as string | null,
  achievements: {} as Record<string, number>,
  leagueIndex: 0,
  friends: [] as Friend[],
  referralCode: makeReferralCode(),
  referrals: 0,
  eventEndsAt: endOfDay(),

  payouts: [] as PayoutRequest[],
  lastReward: null as { coins: number; xp: number } | null,
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      /* ---------------- init / daily rollover ---------------- */
      init: () => {
        const s = get()
        const today = todayKey()

        // regen hearts over time
        let hearts = s.hearts
        let heartsUpdatedAt = s.heartsUpdatedAt
        if (hearts < MAX_HEARTS) {
          const elapsed = Date.now() - s.heartsUpdatedAt
          const gained = Math.floor(elapsed / HEART_REFILL_MS)
          if (gained > 0) {
            hearts = Math.min(MAX_HEARTS, hearts + gained)
            heartsUpdatedAt = hearts >= MAX_HEARTS ? Date.now() : s.heartsUpdatedAt + gained * HEART_REFILL_MS
          }
        }

        // streak decay
        let streak = s.streak
        let streakFreezes = s.streakFreezes
        if (s.lastActiveDay && s.lastActiveDay !== today && s.lastActiveDay !== yesterdayKey()) {
          if (streakFreezes > 0) {
            streakFreezes -= 1
          } else {
            streak = 0
          }
        }

        // daily quests
        const quests = s.questDay === today && s.quests.length ? s.quests : rollQuests()
        const questDay = today

        const friends = s.friends.length ? s.friends : seedFriends()

        set({
          hearts,
          heartsUpdatedAt,
          streak,
          streakFreezes,
          quests,
          questDay,
          friends,
          eventEndsAt: endOfDay(),
        })
      },

      setOnboarded: (v) => set({ ...v, onboarded: true, joinedAt: Date.now() }),
      setCourse: (id) => set({ courseId: id }),

      /* ---------------- core loop ---------------- */
      finishLesson: (lessonId, correct, total, kind) => {
        const s = get()
        const today = todayKey()
        const accuracy = total > 0 ? correct / total : 1
        const perfect = total > 0 && correct === total

        const baseXp = kind === 'boss' ? 30 : kind === 'chest' ? 0 : 15
        const bonusXp = perfect ? 10 : 0
        const xpGain = baseXp + bonusXp

        const baseCoins = kind === 'chest' ? 250 : kind === 'boss' ? 200 : 90
        const accuracyCoins = Math.round(baseCoins * accuracy * 0.4)
        const coinGain = baseCoins + accuracyCoins

        // streak
        let streak = s.streak
        if (s.lastActiveDay !== today) {
          streak = s.lastActiveDay === yesterdayKey() ? s.streak + 1 : 1
        }

        const prev = s.progress[lessonId]
        const stars = Math.max(prev?.stars ?? 0, perfect ? 3 : accuracy >= 0.75 ? 2 : 1)
        const isNew = !prev

        const beforeLevel = levelFromXp(s.xp)
        const xp = s.xp + xpGain
        const leveledUp = levelFromXp(xp) > beforeLevel

        set({
          xp,
          weekXp: s.weekXp + xpGain,
          coins: s.coins + coinGain,
          lifetimeCoins: s.lifetimeCoins + coinGain,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          lastActiveDay: today,
          totalLessons: s.totalLessons + (isNew ? 1 : 0),
          perfectLessons: s.perfectLessons + (perfect && !prev?.bestAccuracy ? 1 : 0),
          progress: {
            ...s.progress,
            [lessonId]: {
              stars,
              bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
              completedAt: Date.now(),
            },
          },
          lastReward: { coins: coinGain, xp: xpGain },
        })

        // quest progress
        get().bumpQuest('xp', xpGain)
        get().bumpQuest('lessons', 1)
        if (perfect) get().bumpQuest('perfect', 1)
        if (streak > s.streak) get().bumpQuest('streak', 1)

        // league promotion at weekly XP thresholds
        const wx = get().weekXp
        const targetLeague = Math.min(LEAGUES.length - 1, Math.floor(wx / 400))
        if (targetLeague > get().leagueIndex) set({ leagueIndex: targetLeague })

        return { xp: xpGain, coins: coinGain, leveledUp }
      },

      loseHeart: () => {
        const s = get()
        if (s.hearts <= 0) return
        set({
          hearts: s.hearts - 1,
          heartsUpdatedAt: s.hearts === MAX_HEARTS ? Date.now() : s.heartsUpdatedAt,
        })
      },

      refillHearts: (all = true) =>
        set((s) => ({
          hearts: all ? MAX_HEARTS : Math.min(MAX_HEARTS, s.hearts + 1),
          heartsUpdatedAt: Date.now(),
        })),

      buyWithCoins: (cost) => {
        const s = get()
        if (s.coins < cost) return false
        set({ coins: s.coins - cost })
        return true
      },

      /* ---------------- quests ---------------- */
      bumpQuest: (metric, amount) =>
        set((s) => ({
          quests: s.quests.map((q) =>
            q.metric === metric && !q.claimed
              ? { ...q, progress: Math.min(q.goal, q.progress + amount) }
              : q,
          ),
        })),

      claimQuest: (id) => {
        const s = get()
        const q = s.quests.find((x) => x.id === id)
        if (!q || q.claimed || q.progress < q.goal) return 0
        set({
          quests: s.quests.map((x) => (x.id === id ? { ...x, claimed: true } : x)),
          coins: s.coins + q.reward,
          lifetimeCoins: s.lifetimeCoins + q.reward,
          xp: s.xp + q.xpReward,
          weekXp: s.weekXp + q.xpReward,
        })
        return q.reward
      },

      /* ---------------- cash out ---------------- */
      requestPayout: (usd, method, destination) => {
        const s = get()
        const cost = Math.round(usd * COINS_PER_USD)
        if (usd < MIN_CASHOUT_USD || s.coins < cost) return null
        const req: PayoutRequest = {
          id: `p_${Date.now()}`,
          usd,
          method,
          destination,
          status: 'pending',
          createdAt: Date.now(),
        }
        set({ coins: s.coins - cost, payouts: [req, ...s.payouts] })
        return req
      },

      addReferral: () =>
        set((s) => ({
          referrals: s.referrals + 1,
          coins: s.coins + 1000,
          lifetimeCoins: s.lifetimeCoins + 1000,
          friends: [
            {
              id: `r${s.referrals}`,
              name: NAMES[(s.referrals + 3) % NAMES.length],
              avatar: AVATARS[(s.referrals + 5) % AVATARS.length],
              xpWeek: Math.round(Math.random() * 200),
              streak: 1,
            },
            ...s.friends,
          ],
        })),

      clearReward: () => set({ lastReward: null }),
      reset: () => set({ ...initial, referralCode: makeReferralCode(), friends: seedFriends() }),
    }),
    { name: 'coinquest-v1' },
  ),
)

/* ------------------------------------------------------------------ */
/* Derived selectors                                                   */
/* ------------------------------------------------------------------ */

export function useLeaderboard(): Friend[] {
  const { friends, name, avatar, weekXp, streak } = useStore()
  const you: Friend = { id: 'you', name, avatar, xpWeek: weekXp, streak, isYou: true }
  return [...friends, you].sort((a, b) => b.xpWeek - a.xpWeek)
}

export function achievementTier(a: Achievement, s: State) {
  const value =
    a.metric === 'xp' ? s.xp
    : a.metric === 'streak' ? s.bestStreak
    : a.metric === 'lessons' ? s.totalLessons
    : a.metric === 'perfect' ? s.perfectLessons
    : a.metric === 'friends' ? s.referrals
    : s.lifetimeCoins

  let tier = 0
  for (const t of a.tiers) if (value >= t) tier++
  const next = a.tiers[Math.min(tier, a.tiers.length - 1)]
  return { value, tier, next, pct: Math.min(1, value / next) }
}

/** "See what's new today" — personalized next-step recommendation. */
export function useRecommendation() {
  const s = useStore()
  const lessons = allLessons(s.courseId)
  const nextIncomplete = lessons.find((l) => !s.progress[l.lesson.id])
  const weakest = lessons
    .filter((l) => s.progress[l.lesson.id] && s.progress[l.lesson.id].bestAccuracy < 1)
    .sort((a, b) => s.progress[a.lesson.id].bestAccuracy - s.progress[b.lesson.id].bestAccuracy)[0]

  if (!nextIncomplete && weakest) {
    return { kind: 'review' as const, lesson: weakest.lesson, unit: weakest.unit, reason: 'Sharpen a weak spot' }
  }
  if (weakest && Math.random() > 0.55) {
    return { kind: 'review' as const, lesson: weakest.lesson, unit: weakest.unit, reason: 'Boost your accuracy' }
  }
  if (nextIncomplete) {
    return {
      kind: 'new' as const,
      lesson: nextIncomplete.lesson,
      unit: nextIncomplete.unit,
      reason: s.totalLessons === 0 ? 'Start your first lesson' : 'Pick up where you left off',
    }
  }
  return null
}

export function nextLessonId(courseId: string, progress: Record<string, LessonResult>) {
  const lessons = allLessons(courseId)
  return (lessons.find((l) => !progress[l.lesson.id]) ?? lessons[lessons.length - 1]).lesson.id
}
