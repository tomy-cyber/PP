import { useEffect, useRef, type ReactNode } from 'react'
import { sheetIn, sheetOut } from '../lib/anim'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** full-height takeover instead of bottom sheet */
  full?: boolean
}

export function Sheet({ open, onClose, children, full }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  useEffect(() => {
    if (open) {
      mounted.current = true
      sheetIn(panel.current, backdrop.current)
    }
  }, [open])

  if (!open) return null

  const close = () => sheetOut(panel.current, backdrop.current, onClose)

  return (
    <div className="fixed inset-0 z-50">
      <div ref={backdrop} className="absolute inset-0 bg-black/45" onClick={close} />
      <div
        ref={panel}
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-2xl ${
          full ? 'top-10 overflow-y-auto no-scrollbar' : ''
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-swan" />
        {children}
      </div>
    </div>
  )
}
