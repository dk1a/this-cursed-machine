import { writable, get } from "svelte/store"

export type ToastType = "warning" | "error"

// An array of muted messages, that won't be toasted
export const mute = [
  "order not met",
  "order already completed",
  "order expired",
  "not completed",
  "no tank available",
  "tank contains different material.",
]

export const change: Record<string, string> = {
  "max players reached": "Unable to ship. Order exhausted",
}

export interface Toast {
  type: ToastType
  message: HTMLElement | string
  timestamp: DOMHighResTimeStamp
  disappear?: boolean
}

export const toasts = writable([] as Toast[])

export function toastMessage(
  message: string,
  toastOptions?: { type?: ToastType; disappear?: boolean }
) {
  if (mute.includes(message)) {
    console.warn("This message was muted", message)
    return
  }

  if (change[message]) {
    message = message.replace(message, change[message])
  }

  const toast: Toast = {
    message,
    type: toastOptions?.type || "warning",
    timestamp: performance.now(),
    disappear: true,
  }
  toasts.set([...get(toasts), toast])
}
