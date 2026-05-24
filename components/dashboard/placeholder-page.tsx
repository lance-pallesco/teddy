type PlaceholderPageProps = {
  title: string
  description?: string
}

export function PlaceholderPage({
  title,
  description = "This module will be implemented in MVP 2.",
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <section className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
        <div className="max-w-sm">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This workspace is ready for the next MVP phase.
          </p>
        </div>
      </section>
    </div>
  )
}
