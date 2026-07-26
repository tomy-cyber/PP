import { useRef } from 'react'
import { float, gsap } from '../lib/anim'
import { useGsap } from '../hooks/useGsap'

type Mood = 'happy' | 'cheer' | 'sad' | 'think'

const FACE: Record<Mood, string> = {
  happy: '🦉',
  cheer: '🦉',
  sad: '🦉',
  think: '🦉',
}

/**
 * Mascot with idle float + mood-driven GSAP reaction.
 * Replace the emoji with your Lottie / SVG rig when you send the artwork.
 */
export function Mascot({
  mood = 'happy',
  size = 88,
  say,
}: {
  mood?: Mood
  size?: number
  say?: string
}) {
  const body = useRef<HTMLDivElement>(null)

  const scope = useGsap(() => {
    float(body.current, 7, 2.1)
    if (mood === 'cheer') {
      gsap.fromTo(
        body.current,
        { rotate: -10, scale: 0.9 },
        { rotate: 0, scale: 1, duration: 0.75, ease: 'elastic.out(1, 0.45)' },
      )
      gsap.to(body.current, { rotate: 8, duration: 0.22, yoyo: true, repeat: 5, ease: 'sine.inOut' })
    }
    if (mood === 'sad') {
      gsap.fromTo(body.current, { y: -10 }, { y: 6, duration: 0.5, ease: 'bounce.out' })
    }
    if (say) {
      gsap.fromTo(
        '[data-bubble]',
        { scale: 0.6, opacity: 0, x: -12 },
        { scale: 1, opacity: 1, x: 0, duration: 0.5, ease: 'back.out(2)', delay: 0.15 },
      )
    }
  }, [mood, say])

  return (
    <div ref={scope} className="flex items-center gap-3">
      <div
        ref={body}
        className="grid place-items-center rounded-full"
        style={{ fontSize: size, lineHeight: 1, filter: mood === 'sad' ? 'grayscale(0.4)' : 'none' }}
      >
        {FACE[mood]}
      </div>
      {say && (
        <div
          data-bubble
          className="relative flex-1 rounded-2xl border-2 border-swan bg-white px-4 py-3 font-sans text-[15px] font-bold text-eel"
          style={{ borderBottomWidth: 4 }}
        >
          {say}
          <span className="absolute -left-[7px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-swan bg-white" />
        </div>
      )}
    </div>
  )
}
