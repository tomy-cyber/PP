import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

const native = () => Capacitor.isNativePlatform()

function webBuzz(ms: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms)
    } catch {
      /* ignore */
    }
  }
}

export const haptic = {
  tap() {
    native() ? void Haptics.impact({ style: ImpactStyle.Light }) : webBuzz(10)
  },
  medium() {
    native() ? void Haptics.impact({ style: ImpactStyle.Medium }) : webBuzz(20)
  },
  heavy() {
    native() ? void Haptics.impact({ style: ImpactStyle.Heavy }) : webBuzz(35)
  },
  success() {
    native()
      ? void Haptics.notification({ type: NotificationType.Success })
      : webBuzz([12, 40, 18])
  },
  error() {
    native() ? void Haptics.notification({ type: NotificationType.Error }) : webBuzz([40, 60, 40])
  },
}
