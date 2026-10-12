import { useEffect, useRef, useSyncExternalStore } from 'react'

export type ProfileDraftFields = {
  name?: string
  description?: string
  keywords?: string[]
  categories?: string[]
  products?: string[]
}

export type SourceDraftFields = {
  keywordsGuide?: string[]
  searchFocus?: string[]
}

type ProfileSlot = {
  getSeed: () => { companyName: string; description: string }
  apply: (draft: ProfileDraftFields) => void
}

type SourceSlot = {
  getUrl: () => string
  apply: (draft: SourceDraftFields) => void
}

let profileSlot: ProfileSlot | null = null
let sourceSlot: SourceSlot | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function profileSnapshot() {
  return profileSlot
}

function sourceSnapshot() {
  return sourceSlot
}

export function getDraftSlots() {
  return { profile: profileSlot, source: sourceSlot }
}

export function useProfileDraftSlot() {
  return useSyncExternalStore(subscribe, profileSnapshot)
}

export function useSourceDraftSlot() {
  return useSyncExternalStore(subscribe, sourceSnapshot)
}

export function useProfileDraftBridge(active: boolean, slot: ProfileSlot) {
  const slotRef = useRef(slot)
  slotRef.current = slot
  useEffect(() => {
    if (!active) return
    const current: ProfileSlot = {
      getSeed: () => slotRef.current.getSeed(),
      apply: (draft) => slotRef.current.apply(draft),
    }
    profileSlot = current
    emit()
    return () => {
      if (profileSlot === current) {
        profileSlot = null
        emit()
      }
    }
  }, [active])
}

export function useSourceDraftBridge(active: boolean, slot: SourceSlot) {
  const slotRef = useRef(slot)
  slotRef.current = slot
  useEffect(() => {
    if (!active) return
    const current: SourceSlot = {
      getUrl: () => slotRef.current.getUrl(),
      apply: (draft) => slotRef.current.apply(draft),
    }
    sourceSlot = current
    emit()
    return () => {
      if (sourceSlot === current) {
        sourceSlot = null
        emit()
      }
    }
  }, [active])
}
