export default function UnauthorizedPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Unauthorized</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account does not have access to this module.
        </p>
      </div>
      <section className="rounded-lg border border-dashed bg-muted/20 p-8">
        <p className="text-sm text-muted-foreground">
          Return to Dashboard from the sidebar, or contact an administrator if
          you believe your role should have access.
        </p>
      </section>
    </div>
  )
}
