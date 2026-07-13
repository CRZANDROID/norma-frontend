type PagePlaceholderProps = {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-norma-muted">{description}</p>
      <div className="mt-6 rounded-lg border border-dashed border-norma-border bg-norma-surface/50 p-10 text-center text-sm text-norma-muted">
        Página vacía — contenido pendiente
      </div>
    </section>
  )
}
