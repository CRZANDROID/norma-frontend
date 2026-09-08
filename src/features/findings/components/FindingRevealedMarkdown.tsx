import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { FindingMarkdown } from '@/features/findings/components/FindingMarkdown'

function scrollPane(from: HTMLElement | null): HTMLElement | null {
  let node = from?.parentElement ?? null
  while (node) {
    const { overflowY } = getComputedStyle(node)
    if (overflowY === 'auto' || overflowY === 'scroll') return node
    node = node.parentElement
  }
  return null
}

export function FindingRevealedMarkdown({
  text,
  play,
  className,
  reserveMinHeight,
}: {
  text: string
  play: boolean
  className?: string
  reserveMinHeight?: number | null
}) {
  const reduceMotion = useReducedMotion()
  const tokens = useMemo(() => text.split(/(\s+)/), [text])
  const shouldPlay = play && !reduceMotion
  const [count, setCount] = useState(shouldPlay ? 0 : tokens.length)
  const hostRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const followRef = useRef(true)
  const ignoreScrollRef = useRef(false)

  useEffect(() => {
    if (!shouldPlay) {
      setCount(tokens.length)
      return
    }
    followRef.current = true
    setCount(0)
    const intervalMs = 56
    const targetMs = 7000
    const step = Math.max(1, Math.ceil((tokens.length * intervalMs) / targetMs))
    const id = window.setInterval(() => {
      setCount((prev) => {
        const next = prev + step
        if (next >= tokens.length) {
          window.clearInterval(id)
          return tokens.length
        }
        return next
      })
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [shouldPlay, text, tokens])

  const done = count >= tokens.length
  const visible = done ? text : tokens.slice(0, count).join('')
  const reserving = shouldPlay && !done

  useEffect(() => {
    if (!reserving) return
    const pane = scrollPane(hostRef.current)
    const caret = caretRef.current
    if (!pane || !caret) return

    const onScroll = () => {
      if (ignoreScrollRef.current) return
      const caretBox = caret.getBoundingClientRect()
      const paneBox = pane.getBoundingClientRect()
      followRef.current = caretBox.bottom > paneBox.top + 12
    }

    pane.addEventListener('scroll', onScroll, { passive: true })
    return () => pane.removeEventListener('scroll', onScroll)
  }, [reserving])

  useLayoutEffect(() => {
    if (!reserving || !followRef.current) return
    const caret = caretRef.current
    const pane = scrollPane(hostRef.current)
    if (!caret || !pane) return
    const caretBox = caret.getBoundingClientRect()
    const paneBox = pane.getBoundingClientRect()
    const overflow = caretBox.bottom - (paneBox.bottom - 96)
    if (overflow <= 0) return
    ignoreScrollRef.current = true
    pane.scrollTop += overflow
    requestAnimationFrame(() => {
      ignoreScrollRef.current = false
    })
  }, [count, reserving])

  return (
    <div
      ref={hostRef}
      aria-busy={reserving || undefined}
      className={className}
      style={
        reserving && reserveMinHeight
          ? { minHeight: reserveMinHeight }
          : undefined
      }
    >
      <div className="grid">
        {reserving ? (
          <div className="invisible col-start-1 row-start-1" aria-hidden>
            <FindingMarkdown text={text} />
          </div>
        ) : null}
        <div className="col-start-1 row-start-1">
          <FindingMarkdown text={visible} />
          {done ? null : (
            <span
              ref={caretRef}
              aria-hidden
              className="mt-1 inline-block h-3.5 w-1.5 rounded-sm bg-norma-accent/85"
            />
          )}
        </div>
      </div>
    </div>
  )
}
