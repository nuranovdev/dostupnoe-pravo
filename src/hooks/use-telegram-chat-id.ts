"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "lexcase.telegram_chat_id"
const listeners = new Set<() => void>()

function readValue(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? ""
  } catch {
    return ""
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener("storage", callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", callback)
  }
}

/**
 * Persists a per-browser Telegram chat id in localStorage.
 *
 * This lets each tester (e.g. an HR reviewer) point new-client notifications at
 * their own Telegram chat without touching server configuration. Backed by
 * useSyncExternalStore so the value stays in sync across components and tabs.
 */
export function useTelegramChatId() {
  const chatId = useSyncExternalStore(
    subscribe,
    readValue,
    () => "" // server snapshot
  )

  const setChatId = useCallback((value: string) => {
    const trimmed = value.trim()
    try {
      if (trimmed) {
        window.localStorage.setItem(STORAGE_KEY, trimmed)
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Ignore storage write errors (e.g. privacy mode).
    }
    // Notify subscribers in this tab (the storage event only fires cross-tab).
    listeners.forEach((listener) => listener())
  }, [])

  return { chatId, setChatId }
}
