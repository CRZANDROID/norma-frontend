import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useReducedMotion } from 'motion/react'

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-norma-fg">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="rounded-md bg-norma-navy/8 px-1 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

export function CatalogAnswer({ text }: { text: string }) {
  const blocks = text.trim().length === 0 ? [] : text.split(/\n{2,}/)

  return (
    <div className="space-y-2.5 text-[15px] leading-relaxed">
      {blocks.map((block, index) => {
        const lines = block.split('\n')
        const listItems = lines.filter((line) => /^\s*[-*]\s+/.test(line))
        if (listItems.length > 0 && listItems.length === lines.filter((l) => l.trim()).length) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-4 marker:text-norma-accent">
              {listItems.map((line, itemIndex) => (
                <li key={itemIndex}>
                  {renderInline(line.replace(/^\s*[-*]\s+/, ''))}
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={index} className="text-pretty">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {renderInline(line)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

export function RevealedAnswer({ text }: { text: string }) {
  const reduceMotion = useReducedMotion()
  const tokens = useMemo(() => text.split(/(\s+)/), [text])
  const [count, setCount] = useState(reduceMotion ? tokens.length : 0)

  useEffect(() => {
    if (reduceMotion) {
      setCount(tokens.length)
      return
    }
    setCount(0)
    const step = Math.max(1, Math.ceil(tokens.length / 40))
    const id = window.setInterval(() => {
      setCount((prev) => {
        const next = prev + step
        if (next >= tokens.length) {
          window.clearInterval(id)
          return tokens.length
        }
        return next
      })
    }, 18)
    return () => window.clearInterval(id)
  }, [text, tokens, reduceMotion])

  const done = count >= tokens.length
  if (done) return <CatalogAnswer text={text} />

  return (
    <span className="whitespace-pre-wrap text-[15px] leading-relaxed">
      {tokens.slice(0, count).join('')}
      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-px rounded-sm bg-norma-accent/85" />
    </span>
  )
}
