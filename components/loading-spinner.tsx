export function LoadingSpinner() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-blue-600 dark:border-neutral-700" />
    </main>
  );
}
