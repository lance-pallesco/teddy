import { cn } from "@/lib/utils"

type PetFormSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function PetFormSection({
  title,
  description,
  children,
  className,
}: PetFormSectionProps) {
  return (
    <section className={cn("rounded-lg border p-5 md:p-6", className)}>
      <div className="mb-6">
        <h2 className="text-lg font-medium">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function PetFormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>
}
