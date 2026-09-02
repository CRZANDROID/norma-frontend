import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { duration } from '@/shared/lib/motion'
import { NormaThinkingOrb } from '@/shared/ui/thinking-orb'

function Caret() {
  return (
    <motion.span
      aria-hidden
      className="ml-px inline-block h-[0.95em] w-[1.5px] translate-y-[0.12em] bg-norma-accent align-baseline"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1.06,
        repeat: Infinity,
        ease: 'linear',
        times: [0, 0.48, 0.52, 1],
      }}
    />
  )
}

function AiMark({ writing }: { writing: boolean }) {
  return (
    <NormaThinkingOrb
      state={writing ? 'composing' : 'breathing'}
      size={20}
      className="ml-1 inline-block align-middle"
      aria-hidden
    />
  )
}

export function AiWrittenText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const chars = useMemo(() => Array.from(text), [text])
  const [count, setCount] = useState(reduceMotion ? chars.length : 0)
  const skipRef = useRef(false)

  useEffect(() => {
    if (reduceMotion) {
      setCount(chars.length)
      return
    }
    skipRef.current = false
    setCount(0)
    if (chars.length === 0) return

    const durationMs = Math.min(2200, Math.max(800, chars.length * 12))
    const delayMs = duration.fast * 1000
    const started = performance.now()
    let frame = 0

    const tick = (now: number) => {
      if (skipRef.current) return
      const elapsed = now - started - delayMs
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick)
        return
      }
      const t = Math.min(1, elapsed / durationMs)
      setCount(Math.floor(t * chars.length))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      skipRef.current = true
      cancelAnimationFrame(frame)
    }
  }, [chars.length, reduceMotion, text])

  const done = count >= chars.length
  const shown = chars.slice(0, count).join('')

  if (text.length === 0) return null

  return (
    <p
      className={className}
      aria-busy={!reduceMotion && !done}
      onClick={
        done || reduceMotion
          ? undefined
          : () => {
              skipRef.current = true
              setCount(chars.length)
            }
      }
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="whitespace-pre-wrap">
        {shown}
        {reduceMotion ? null : <Caret />}
        <AiMark writing={!done} />
      </span>
    </p>
  )
}
