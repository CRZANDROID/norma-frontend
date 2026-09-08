import type { Components } from 'react-markdown'
import Markdown from 'react-markdown'
import { cn } from '@/shared/lib/utils'

const mdComponents: Components = {
  h1: ({ children }) => (
    <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-pretty first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-pretty first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-3 font-display text-base font-semibold tracking-tight first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mt-2 leading-relaxed text-pretty first:mt-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-2 list-disc space-y-1 pl-5 first:mt-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2 list-decimal space-y-1 pl-5 first:mt-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-norma-fg">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => {
    const safe =
      typeof href === 'string' &&
      (href.startsWith('http://') || href.startsWith('https://'))
    if (!safe) return <span>{children}</span>
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-norma-accent underline decoration-norma-accent/40 underline-offset-2 hover:decoration-norma-accent"
      >
        {children}
      </a>
    )
  },
  code: ({ children }) => (
    <code className="rounded-md bg-norma-navy/6 px-1 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-2 border-l-2 border-norma-accent/40 pl-3 text-norma-muted first:mt-0">
      {children}
    </blockquote>
  ),
}

export function FindingMarkdown({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  if (!text.trim()) return null
  return (
    <div
      className={cn(
        'max-w-prose text-[15px] break-words text-norma-fg',
        className,
      )}
    >
      <Markdown components={mdComponents}>{text}</Markdown>
    </div>
  )
}
