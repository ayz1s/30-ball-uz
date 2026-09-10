export function UnknownBlock({ type }: { type: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
      Этот блок пока не поддерживается ({type})
    </div>
  );
}
