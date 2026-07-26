/**
 * Content engine.
 * Courses → Units → Lessons → Exercises.
 * Swap this file (or feed it from an API) to change the subject matter.
 */

export type ExerciseKind = 'choice' | 'truefalse' | 'bank' | 'match' | 'tap'

export interface ChoiceEx {
  id: string
  kind: 'choice'
  prompt: string
  emoji?: string
  options: string[]
  answer: number
  hint?: string
}
export interface TrueFalseEx {
  id: string
  kind: 'truefalse'
  prompt: string
  statement: string
  answer: boolean
  hint?: string
}
export interface BankEx {
  id: string
  kind: 'bank'
  prompt: string
  /** sentence with ___ marking the blank */
  sentence: string
  bank: string[]
  answer: string
  hint?: string
}
export interface MatchEx {
  id: string
  kind: 'match'
  prompt: string
  pairs: { left: string; right: string }[]
}
export interface TapEx {
  id: string
  kind: 'tap'
  prompt: string
  /** correct ordering of tokens */
  answer: string[]
  distractors: string[]
  hint?: string
}

export type Exercise = ChoiceEx | TrueFalseEx | BankEx | MatchEx | TapEx

export interface Lesson {
  id: string
  title: string
  icon: string
  /** 'lesson' | 'chest' (bonus coins) | 'boss' (unit review) */
  type: 'lesson' | 'chest' | 'boss'
  exercises: Exercise[]
}

export interface Unit {
  id: string
  title: string
  subtitle: string
  color: 'feather' | 'macaw' | 'bee' | 'beetle' | 'fox' | 'cardinal'
  lessons: Lesson[]
}

export interface Course {
  id: string
  name: string
  flag: string
  blurb: string
  units: Unit[]
}

const ex = {
  choice: (
    id: string,
    prompt: string,
    options: string[],
    answer: number,
    extra: Partial<ChoiceEx> = {},
  ): ChoiceEx => ({ id, kind: 'choice', prompt, options, answer, ...extra }),
  tf: (id: string, statement: string, answer: boolean, hint?: string): TrueFalseEx => ({
    id,
    kind: 'truefalse',
    prompt: 'True or false?',
    statement,
    answer,
    hint,
  }),
  bank: (
    id: string,
    sentence: string,
    answer: string,
    bank: string[],
    hint?: string,
  ): BankEx => ({
    id,
    kind: 'bank',
    prompt: 'Complete the sentence',
    sentence,
    answer,
    bank,
    hint,
  }),
  match: (id: string, pairs: { left: string; right: string }[]): MatchEx => ({
    id,
    kind: 'match',
    prompt: 'Tap the matching pairs',
    pairs,
  }),
  tap: (id: string, prompt: string, answer: string[], distractors: string[]): TapEx => ({
    id,
    kind: 'tap',
    prompt,
    answer,
    distractors,
  }),
}

/* ================================================================== */
/* COURSE 1 — Money Skills (financial literacy)                        */
/* ================================================================== */

const money: Course = {
  id: 'money',
  name: 'Money Skills',
  flag: '💰',
  blurb: 'Budgeting, saving, credit & investing',
  units: [
    {
      id: 'm-u1',
      title: 'Unit 1',
      subtitle: 'Budgeting basics',
      color: 'feather',
      lessons: [
        {
          id: 'm-u1-l1',
          title: 'Income vs. expenses',
          icon: '⭐',
          type: 'lesson',
          exercises: [
            ex.choice(
              'm1',
              'Which of these is INCOME?',
              ['Your monthly rent', 'Your paycheck', 'Your phone bill', 'Groceries'],
              1,
              { emoji: '💵', hint: 'Income is money coming in.' },
            ),
            ex.tf('m2', 'A budget tells your money where to go before you spend it.', true),
            ex.bank(
              'm3',
              'Money left after expenses is called ___.',
              'surplus',
              ['deficit', 'surplus', 'interest', 'principal'],
            ),
            ex.choice(
              'm4',
              'You earn $3,000 and spend $3,400. This is a…',
              ['Surplus', 'Break-even', 'Deficit', 'Dividend'],
              2,
            ),
            ex.match('m5', [
              { left: 'Fixed cost', right: 'Rent' },
              { left: 'Variable cost', right: 'Groceries' },
              { left: 'Income', right: 'Salary' },
              { left: 'Debt', right: 'Car loan' },
            ]),
          ],
        },
        {
          id: 'm-u1-l2',
          title: 'The 50/30/20 rule',
          icon: '📊',
          type: 'lesson',
          exercises: [
            ex.choice(
              'm6',
              'In the 50/30/20 rule, what does the 20% cover?',
              ['Wants', 'Needs', 'Savings & debt payoff', 'Taxes'],
              2,
            ),
            ex.tf('m7', 'Under 50/30/20, "needs" should take about half your take-home pay.', true),
            ex.bank(
              'm8',
              'Streaming subscriptions belong in the ___ category.',
              'wants',
              ['needs', 'wants', 'savings', 'taxes'],
            ),
            ex.choice(
              'm9',
              'Take-home pay is $2,000. How much goes to savings under the rule?',
              ['$200', '$400', '$600', '$1,000'],
              1,
            ),
          ],
        },
        {
          id: 'm-u1-l3',
          title: 'Bonus chest',
          icon: '🎁',
          type: 'chest',
          exercises: [],
        },
        {
          id: 'm-u1-l4',
          title: 'Emergency fund',
          icon: '🛟',
          type: 'lesson',
          exercises: [
            ex.choice(
              'm10',
              'A starter emergency fund usually covers…',
              ['1 day', '1 week', '3–6 months of expenses', '10 years'],
              2,
            ),
            ex.tf('m11', 'An emergency fund should be invested in volatile stocks.', false,
              'It needs to be liquid and safe.'),
            ex.tap('m12', 'Build the sentence', ['Pay', 'yourself', 'first'], ['later', 'never', 'twice']),
          ],
        },
        {
          id: 'm-u1-l5',
          title: 'Unit 1 review',
          icon: '🏆',
          type: 'boss',
          exercises: [
            ex.choice('m13', 'Which is a NEED?', ['Concert ticket', 'Electricity bill', 'New sneakers', 'Game pass'], 1),
            ex.tf('m14', 'A deficit means you spent more than you earned.', true),
            ex.bank('m15', 'Set money aside automatically — this is called ___ saving.', 'automatic',
              ['automatic', 'manual', 'random', 'delayed']),
            ex.choice('m16', 'Best first financial goal?', ['Buy stocks', 'Emergency fund', 'Buy a boat', 'Max a credit card'], 1),
          ],
        },
      ],
    },
    {
      id: 'm-u2',
      title: 'Unit 2',
      subtitle: 'Credit & debt',
      color: 'macaw',
      lessons: [
        {
          id: 'm-u2-l1',
          title: 'How credit works',
          icon: '💳',
          type: 'lesson',
          exercises: [
            ex.choice('m17', 'What does APR stand for?', ['Annual Payment Ratio', 'Annual Percentage Rate', 'Average Principal Return', 'Applied Purchase Rate'], 1),
            ex.tf('m18', 'Paying only the minimum on a credit card is the cheapest strategy.', false),
            ex.bank('m19', 'The amount you originally borrowed is the ___.', 'principal',
              ['principal', 'interest', 'premium', 'dividend']),
            ex.match('m20', [
              { left: 'APR', right: 'Yearly cost of borrowing' },
              { left: 'Credit limit', right: 'Max you can charge' },
              { left: 'Utilization', right: 'Balance ÷ limit' },
              { left: 'Minimum payment', right: 'Smallest allowed payment' },
            ]),
          ],
        },
        {
          id: 'm-u2-l2',
          title: 'Credit score',
          icon: '📈',
          type: 'lesson',
          exercises: [
            ex.choice('m21', 'Biggest factor in most credit scores?', ['Payment history', 'Your age', 'Your job title', 'Your zip code'], 0),
            ex.tf('m22', 'Keeping utilization below ~30% generally helps your score.', true),
            ex.choice('m23', 'Which action likely LOWERS a score?', ['Paying on time', 'Maxing out a card', 'Old accounts staying open', 'Low balances'], 1),
          ],
        },
        { id: 'm-u2-l3', title: 'Bonus chest', icon: '🎁', type: 'chest', exercises: [] },
        {
          id: 'm-u2-l4',
          title: 'Unit 2 review',
          icon: '🏆',
          type: 'boss',
          exercises: [
            ex.choice('m24', 'Debt avalanche pays off first…', ['Smallest balance', 'Highest interest rate', 'Newest debt', 'Oldest debt'], 1),
            ex.tf('m25', 'Debt snowball targets the smallest balance first.', true),
            ex.tap('m26', 'Build the sentence', ['Never', 'carry', 'a', 'balance'], ['always', 'card', 'twice']),
          ],
        },
      ],
    },
    {
      id: 'm-u3',
      title: 'Unit 3',
      subtitle: 'Investing 101',
      color: 'beetle',
      lessons: [
        {
          id: 'm-u3-l1',
          title: 'Compound interest',
          icon: '🌱',
          type: 'lesson',
          exercises: [
            ex.choice('m27', 'Compound interest means you earn interest on…', ['Only your deposit', 'Deposit + past interest', 'Only the bank’s money', 'Your salary'], 1),
            ex.tf('m28', 'Starting to invest earlier gives compounding more time to work.', true),
            ex.bank('m29', 'Rule of 72: 72 ÷ rate ≈ years to ___ your money.', 'double',
              ['double', 'triple', 'halve', 'lose']),
          ],
        },
        {
          id: 'm-u3-l2',
          title: 'Diversification',
          icon: '🧺',
          type: 'lesson',
          exercises: [
            ex.choice('m30', 'Diversification mainly reduces…', ['Taxes', 'Fees', 'Risk from any single asset', 'Inflation'], 2),
            ex.tf('m31', 'Putting 100% of savings into one stock is well diversified.', false),
            ex.match('m32', [
              { left: 'Stock', right: 'Ownership share' },
              { left: 'Bond', right: 'A loan you make' },
              { left: 'Index fund', right: 'Basket of many assets' },
              { left: 'Dividend', right: 'Profit paid to owners' },
            ]),
          ],
        },
        { id: 'm-u3-l3', title: 'Unit 3 review', icon: '🏆', type: 'boss', exercises: [
          ex.choice('m33', 'Long-term investing works best when you…', ['Trade daily', 'Stay consistent', 'Time the market', 'Panic sell'], 1),
          ex.tf('m34', 'Higher expected return generally comes with higher risk.', true),
        ] },
      ],
    },
  ],
}

/* ================================================================== */
/* COURSE 2 — Brain Trivia                                             */
/* ================================================================== */

const trivia: Course = {
  id: 'trivia',
  name: 'Brain Trivia',
  flag: '🧠',
  blurb: 'Science, history, geography & pop culture',
  units: [
    {
      id: 't-u1',
      title: 'Unit 1',
      subtitle: 'Planet Earth',
      color: 'macaw',
      lessons: [
        {
          id: 't-u1-l1',
          title: 'Geography',
          icon: '🌍',
          type: 'lesson',
          exercises: [
            ex.choice('t1', 'Largest ocean on Earth?', ['Atlantic', 'Indian', 'Pacific', 'Arctic'], 2, { emoji: '🌊' }),
            ex.tf('t2', 'The Sahara is the largest hot desert in the world.', true),
            ex.bank('t3', 'The longest river in South America is the ___.', 'Amazon',
              ['Nile', 'Amazon', 'Danube', 'Volga']),
            ex.match('t4', [
              { left: 'Japan', right: 'Tokyo' },
              { left: 'Kenya', right: 'Nairobi' },
              { left: 'Norway', right: 'Oslo' },
              { left: 'Peru', right: 'Lima' },
            ]),
          ],
        },
        {
          id: 't-u1-l2',
          title: 'Animals',
          icon: '🦋',
          type: 'lesson',
          exercises: [
            ex.choice('t5', 'Which animal has the largest heart?', ['Elephant', 'Blue whale', 'Giraffe', 'Horse'], 1),
            ex.tf('t6', 'Octopuses have three hearts.', true),
            ex.choice('t7', 'A group of crows is called a…', ['Pod', 'Murder', 'Herd', 'School'], 1),
          ],
        },
        { id: 't-u1-l3', title: 'Bonus chest', icon: '🎁', type: 'chest', exercises: [] },
        {
          id: 't-u1-l4',
          title: 'Unit 1 review',
          icon: '🏆',
          type: 'boss',
          exercises: [
            ex.choice('t8', 'Tallest mountain above sea level?', ['K2', 'Everest', 'Denali', 'Kilimanjaro'], 1),
            ex.tf('t9', 'Australia is both a country and a continent.', true),
            ex.tap('t10', 'Build the phrase', ['Seven', 'continents', 'five', 'oceans'], ['nine', 'planets', 'moons']),
          ],
        },
      ],
    },
    {
      id: 't-u2',
      title: 'Unit 2',
      subtitle: 'Science & space',
      color: 'beetle',
      lessons: [
        {
          id: 't-u2-l1',
          title: 'The solar system',
          icon: '🪐',
          type: 'lesson',
          exercises: [
            ex.choice('t11', 'Which planet has the most moons?', ['Earth', 'Mars', 'Saturn', 'Venus'], 2),
            ex.tf('t12', 'Light from the Sun takes about 8 minutes to reach Earth.', true),
            ex.bank('t13', 'The force pulling objects toward each other is ___.', 'gravity',
              ['gravity', 'friction', 'magnetism', 'inertia']),
          ],
        },
        {
          id: 't-u2-l2',
          title: 'Human body',
          icon: '🫀',
          type: 'lesson',
          exercises: [
            ex.choice('t14', 'How many bones in an adult human body?', ['106', '206', '306', '406'], 1),
            ex.tf('t15', 'The largest organ in the human body is the skin.', true),
            ex.match('t16', [
              { left: 'Heart', right: 'Pumps blood' },
              { left: 'Lungs', right: 'Exchange gases' },
              { left: 'Liver', right: 'Filters toxins' },
              { left: 'Brain', right: 'Processes signals' },
            ]),
          ],
        },
        { id: 't-u2-l3', title: 'Unit 2 review', icon: '🏆', type: 'boss', exercises: [
          ex.choice('t17', 'What is H₂O?', ['Salt', 'Water', 'Oxygen', 'Hydrogen peroxide'], 1),
          ex.tf('t18', 'Sound travels faster in water than in air.', true),
        ] },
      ],
    },
  ],
}

/* ================================================================== */
/* COURSE 3 — Sandbox (placeholder / plug your content here)           */
/* ================================================================== */

const sandbox: Course = {
  id: 'sandbox',
  name: 'Sandbox',
  flag: '🧩',
  blurb: 'Placeholder deck — swap in your own content',
  units: [
    {
      id: 's-u1',
      title: 'Unit 1',
      subtitle: 'Demo content',
      color: 'fox',
      lessons: [
        {
          id: 's-u1-l1',
          title: 'Sample lesson',
          icon: '✏️',
          type: 'lesson',
          exercises: [
            ex.choice('s1', 'Replace me with your own question.', ['Option A', 'Option B (correct)', 'Option C', 'Option D'], 1),
            ex.tf('s2', 'This deck exists so you can test the engine end to end.', true),
            ex.bank('s3', 'Every exercise type renders from a plain ___ object.', 'JSON',
              ['JSON', 'XML', 'CSV', 'YAML']),
            ex.match('s4', [
              { left: 'choice', right: 'Multiple choice' },
              { left: 'truefalse', right: 'True / false' },
              { left: 'bank', right: 'Fill the blank' },
              { left: 'match', right: 'Pair matching' },
            ]),
            ex.tap('s5', 'Build the sentence', ['Content', 'is', 'data'], ['code', 'hardcoded', 'fixed']),
          ],
        },
        { id: 's-u1-l2', title: 'Bonus chest', icon: '🎁', type: 'chest', exercises: [] },
        { id: 's-u1-l3', title: 'Sample review', icon: '🏆', type: 'boss', exercises: [
          ex.choice('s6', 'Where do I edit content?', ['src/data/content.ts', 'index.html', 'tailwind.config.js', 'nowhere'], 0),
        ] },
      ],
    },
  ],
}

export const COURSES: Course[] = [money, trivia, sandbox]

export const findCourse = (id: string) => COURSES.find((c) => c.id === id) ?? COURSES[0]

export function allLessons(courseId: string): { unit: Unit; lesson: Lesson; index: number }[] {
  const out: { unit: Unit; lesson: Lesson; index: number }[] = []
  let i = 0
  for (const unit of findCourse(courseId).units) {
    for (const lesson of unit.lessons) out.push({ unit, lesson, index: i++ })
  }
  return out
}

export function findLesson(courseId: string, lessonId: string) {
  return allLessons(courseId).find((l) => l.lesson.id === lessonId)
}
